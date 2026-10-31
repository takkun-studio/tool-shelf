/* eslint @typescript-eslint/no-require-imports: off */
/* global require, __dirname */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function open(id,initial=null){
 const html=fs.readFileSync(path.join(__dirname,'..',id,'index.html'),'utf8');
 const elements={};
 function el(id){return elements[id] ||= {value:'',textContent:'',innerHTML:'',dataset:{},addEventListener(){},replaceChildren(){},append(){},click(){},scrollTo(){},focus(){},setAttribute(){},files:[]};}
 for(const m of html.matchAll(/<input\b([^>]*)>/g)){const a=m[1],name=/\bid="([^"]+)"/.exec(a);if(name)el(name[1]).value=(/\bvalue="([^"]*)"/.exec(a)||[])[1]||'';}
 let lastBlob;const map=new Map();const key=id==='profit'?'profit-pro-v1':'tool-shelf-pro-'+id;if(initial!==null)map.set(key,initial);
 const storage={fail:false,getItem(k){return map.has(k)?map.get(k):null},setItem(k,v){if(this.fail)throw Error('quota');map.set(k,String(v));}};
 const ctx=vm.createContext({document:{getElementById:el,querySelectorAll(){return []},createElement(){return el('_created')}},localStorage:storage,Intl,Number,Math,Date,JSON,Blob,TextEncoder,TextDecoder,Uint8Array,URL:{createObjectURL(blob){lastBlob=blob;return 'blob:mock'},revokeObjectURL(){}},confirm:()=>true,alert(){},setTimeout(){},window:{scrollTo(){},print(){}}});
 const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];vm.runInContext(js,ctx,{filename:id});
 return {ctx,el,storage,key,download:()=>lastBlob,run:expr=>vm.runInContext(expr,ctx)};
}

const ts=require('typescript');
function free(id,v){const source=fs.readFileSync(path.join(__dirname,'../../..','src','tools',id,'calculate.ts'),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const row=(id,label,value)=>({id,label,value});const exports={};vm.runInNewContext(code,{exports,require:()=>({money:row,percent:row,quantity:row,numberResult:row}),Math});return exports.calculate(v).rows;}
const cases={
 breakeven:[{price:1000,variableCost:400,fixedCost:3000},{margin:'限界利益',marginRate:'限界利益率（%）',breakEvenQuantity:'損益分岐点数量',breakEvenSales:'損益分岐点売上'}],
 channel:[{priceA:1000,costA:400,shippingA:100,salesFeeA:10,paymentFeeA:5,priceB:1500,costB:300,shippingB:100,salesFeeB:10,paymentFeeB:5},{profitA:'A 利益',profitB:'B 利益',payoutA:'A 手取り金額',payoutB:'B 手取り金額',difference:'利益差 A-B'}],
 discount:[{listPrice:1000,discountRate:20,cost:400,shipping:100,feeRate:10,fixedFee:20,other:30},{salePrice:'セール価格',profit:'セール後利益',profitRate:'利益率（%）',fee:'販売手数料',minimumPrice:'損益ゼロ価格'}],
 inventory:[{stock:20,unitCost:500,monthlySales:5},{stockValue:'在庫金額',stock:'現在庫数',months:'在庫持ち月数',monthlySales:'月間販売数'}],
 investment:[{initialCost:10000,profitPerSale:500,monthlyCount:8},{breakEvenCount:'回収件数',recoveryMonths:'回収月数',initialCost:'初期費用',monthlyProfit:'月間利益'}],
 market:[{price:1000,quantity:10,unitCost:400,booth:1000,travel:500,parking:0,supplies:0,otherFixed:0,cashlessRate:50,paymentRate:10},{sales:'売上',total:'総コスト',profit:'最終利益',profitRate:'利益率（%）',payment:'決済手数料',unitMargin:'1個あたり限界利益',breakEvenQuantity:'損益分岐点数量',breakEvenSales:'損益分岐点売上'}],
 payout:[{price:1000,cost:400,shipping:100,salesFeeRate:10,paymentFeeRate:5,fixedFee:10,other:40},{payout:'手取り売上',profit:'利益',fees:'手数料合計',profitRate:'利益率（%）'}],
 profit:[{price:1000,cost:400,shipping:100,feeRate:10,fixedFee:20,other:30,target:0},{profit:'profit',profitRate:'margin',total:'total',fee:'fee',costRate:'costRate',breakEvenPrice:'required'}],
 service:[{hourlyRate:2000,hours:3,expenses:500},{price:'必要料金',labor:'作業報酬',expenses:'経費'}],
 target:[{targetProfit:10000,profitPerSale:500,price:2000,fixedCost:5000},{requiredProfit:'必要利益',requiredCount:'必要販売数',requiredSales:'必要売上'}]
};
for(const [id,[values,mapping]] of Object.entries(cases))test(`${id}: every free result matches PRO for representative inputs`,()=>{const app=open(id);app.ctx.parityValues=values;const actual=app.run(id==='profit'?'calc(parityValues)':'compute(parityValues,0)');const rows=free(id,values);assert.deepEqual(Array.from(rows,x=>x.id).sort(),Object.keys(mapping).sort());for(const row of rows){const v=actual[mapping[row.id]];assert.ok(v!==undefined,`${row.id} missing`);if(row.value===null)assert.equal(v,null,row.id);else assert.ok(Math.abs(v-row.value)<1e-8,`${row.id}: free ${row.value}, PRO ${v}`)}});
test('zero-goal edge intentionally returns zero sales when nothing needs recovering',()=>{for(const [id,v,freeKey,proKey] of [['investment',{initialCost:0,profitPerSale:0,monthlyCount:0},'breakEvenCount','回収件数'],['target',{targetProfit:0,profitPerSale:0,price:0,fixedCost:0},'requiredCount','必要販売数']]){const a=open(id);a.ctx.parityValues=v;assert.equal(free(id,v).find(x=>x.id===freeKey).value,null);assert.equal(a.run('compute(parityValues,0)')[proKey],0)}});

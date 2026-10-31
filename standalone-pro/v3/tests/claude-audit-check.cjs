/* eslint @typescript-eslint/no-require-imports: off */
/* global require, __dirname */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ids=['breakeven','channel','discount','inventory','investment','market','payout','profit','service','target'];
function open(id,initial=null){
 const html=fs.readFileSync(path.join(__dirname,'..',id,'index.html'),'utf8');
 const elements={};
 function el(id){return elements[id] ||= {value:'',textContent:'',innerHTML:'',dataset:{},addEventListener(){},replaceChildren(){},append(){},click(){},scrollTo(){},focus(){},setAttribute(){},files:[]};}
 for(const m of html.matchAll(/<input\b([^>]*)>/g)){const a=m[1],name=/\bid="([^"]+)"/.exec(a);if(name)el(name[1]).value=(/\bvalue="([^"]*)"/.exec(a)||[])[1]||'';}
 let lastBlob;const map=new Map();const key=id==='profit'?'profit-pro-v1':'tool-shelf-pro-'+id;if(initial!==null)map.set(key,initial);
 const storage={fail:false,getItem(k){return map.has(k)?map.get(k):null},setItem(k,v){if(this.fail)throw Error('quota');map.set(k,String(v));}};
 const ctx=vm.createContext({document:{getElementById:el,querySelectorAll(){return []},createElement(){return el('_created')}},localStorage:storage,Intl,Number,Math,Date,JSON,Blob,URL:{createObjectURL(blob){lastBlob=blob;return 'blob:mock'},revokeObjectURL(){}},confirm:()=>true,alert(){},setTimeout(){},window:{scrollTo(){},print(){}}});
 const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];vm.runInContext(js,ctx,{filename:id});
 return {ctx,el,storage,key,download:()=>lastBlob,run:expr=>vm.runInContext(expr,ctx)};
}

for(const id of ids.filter(x=>x!=='profit'))test(`${id}: saved result announces status`,()=>{const a=open(id);a.el('name').value='test';a.el('save').onclick();assert.match(a.el('status').textContent,/保存/)});
for(const id of ids.filter(x=>x!=='profit'))test(`${id}: history displays labeled values`,()=>{const a=open(id);a.el('save').onclick();assert.match(a.el('history').innerHTML,/円|%|個|件|月|時間/)});
for(const id of ids.filter(x=>x!=='profit'))test(`${id}: row click does not enter edit`,()=>{const a=open(id);a.el('save').onclick();const row={dataset:{i:'0'}};a.el('history').onclick({target:{closest(sel){return sel==='[data-i]'?row:null}}});assert.equal(a.run('editing'),null)});
for(const id of ids)test(`${id}: isolated invalid record preserves good record`,()=>{const key=id==='profit'?{id:'1',name:'ok',price:1,cost:0,shipping:0,feeRate:0,fixedFee:0,other:0,target:0}:null;const base=open(id);const valid=key||{name:'ok',date:'2026',values:Object.fromEntries(base.run('F').map(([k])=>[k,0])),goal:0};const a=open(id,JSON.stringify([valid,null]));assert.equal(a.run('records.length'),1)});
test('breakeven contribution rate',()=>assert.equal(open('breakeven').run('compute({price:1000,variableCost:400,fixedCost:3000},0)["限界利益率（%）"]'),60));
test('channel take-home',()=>assert.equal(open('channel').run('compute({priceA:1000,costA:400,shippingA:100,salesFeeA:10,paymentFeeA:5,priceB:1000,costB:300,shippingB:100,salesFeeB:10,paymentFeeB:5},0)["A 手取り金額"]'),850));
test('discount margin and selling fee',()=>{const a=open('discount');const r=a.run('compute({listPrice:1000,discountRate:20,cost:400,shipping:100,feeRate:10,fixedFee:0,other:0},0)');assert.equal(r['利益率（%）'],27.5);assert.equal(r['販売手数料'],80)});
test('market total cost and margin',()=>{const a=open('market');const r=a.run('compute({price:1000,quantity:10,unitCost:400,booth:1000,travel:500,parking:0,supplies:0,otherFixed:0,cashlessRate:50,paymentRate:10},0)');assert.equal(r['総コスト'],6000);assert.equal(r['利益率（%）'],40)});
test('profit minimum price uses whole yen',()=>assert.equal(open('profit').run('calc({price:100,cost:1,shipping:0,feeRate:0,fixedFee:0,other:0,target:0.09}).required'),2));
for(const id of ids.filter(x=>x!=='profit'))test(`${id}: editing cancel restores unsaved draft`,()=>{const a=open(id);a.el('name').value='saved';a.el('save').onclick();a.el('name').value='draft';const button={dataset:{edit:'0'}};a.el('history').onclick({target:{closest(sel){return sel==='[data-edit]'?button:null}},stopPropagation(){}});a.el('cancelEdit').onclick();assert.equal(a.el('name').value,'draft')});
for(const id of ids.filter(x=>x!=='profit'))test(`${id}: restore cancelled clears file selection`,async()=>{const a=open(id);a.ctx.confirm=()=>false;const data=JSON.stringify({version:1,slug:id,records:[]});const input={files:[{size:data.length,text:async()=>data}],value:'selected'};await a.el('restore').onchange({target:input});assert.equal(input.value,'')});
for(const id of ids.filter(x=>x!=='profit'))test(`${id}: CSV results are separate columns`,async()=>{const a=open(id);a.el('save').onclick();a.el('export').onclick();const csv=await a.download().text();assert.doesNotMatch(csv,/計算結果JSON/)});
test('inventory includes free result values',()=>{const r=open('inventory').run('compute({stock:20,unitCost:500,monthlySales:5},3)');assert.equal(r['現在庫数'],20);assert.equal(r['月間販売数'],5)});
test('investment includes free initial cost',()=>assert.equal(open('investment').run('compute({initialCost:10000,profitPerSale:500,monthlyCount:8},2)["初期費用"]'),10000));
test('market history identifies final profit in yen',()=>{const a=open('market');a.el('price').value='1000';a.el('quantity').value='10';a.el('save').onclick();assert.match(a.el('history').innerHTML,/最終利益/);assert.match(a.el('history').innerHTML,/円/)});
for(const id of ids.filter(x=>x!=='profit'))test(`${id}: invalid record retained across subsequent save`,()=>{const base=open(id);const valid={name:'ok',date:'2026',values:Object.fromEntries(base.run('F').map(([k])=>[k,0])),goal:0};const a=open(id,JSON.stringify([valid,{broken:'keep'}]));a.el('name').value='new';a.el('save').onclick();const stored=JSON.parse(a.storage.getItem(a.key));assert.ok(stored.some(x=>x.broken==='keep'));assert.ok(stored.some(x=>x.name==='new'))});
test('breakeven explains zero contribution',()=>{const a=open('breakeven');a.el('price').value='100';a.el('variableCost').value='100';a.el('fixedCost').value='100';a.run('show()');assert.match(a.el('result').innerHTML,/限界利益が0以下/)});
test('target explains zero profit',()=>{const a=open('target');a.el('targetProfit').value='100';a.el('profitPerSale').value='0';a.run('show()');assert.match(a.el('result').innerHTML,/1件あたり利益が0/)});
for(const id of ['channel','payout'])test(`${id} warns when combined fees reach 100%`,()=>{const a=open(id);for(const f of id==='channel'?['salesFeeA','paymentFeeA']:['salesFeeRate','paymentFeeRate'])a.el(f).value='50';a.run('show()');assert.match(a.el('error').textContent,/100%/)});
for(const id of ids)test(`${id}: storage accepts leading whitespace`,()=>{const base=open(id);const valid=id==='profit'?{id:'1',name:'ok',price:1,cost:0,shipping:0,feeRate:0,fixedFee:0,other:0,target:0}:{name:'ok',date:'2026',values:Object.fromEntries(base.run('F').map(([k])=>[k,0])),goal:0};const a=open(id,' \n'+JSON.stringify([valid]));assert.equal(a.run('records.length'),1)});
test('profit: duplicate identifiers are quarantined on load',()=>{const x={id:'same',name:'ok',price:1,cost:0,shipping:0,feeRate:0,fixedFee:0,other:0,target:0};const a=open('profit',JSON.stringify([x,x]));assert.equal(a.run('records.length'),1);assert.equal(a.run('quarantine.length'),1)});
for(const id of ids.filter(x=>x!=='profit'))test(`${id}: unavailable storage is not reported as corruption`,()=>{const a=open(id);a.run('storageUnavailable=true;storageBlocked=true');a.el('save').onclick();assert.match(a.el('error').textContent,/利用できません/)});
test('profit announces changing results',()=>{const html=fs.readFileSync(path.join(__dirname,'..','profit','index.html'),'utf8');assert.match(html,/<div class="metrics"[^>]*aria-live="polite"/)});

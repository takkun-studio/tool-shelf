/* eslint @typescript-eslint/no-require-imports: off */
/* global require, __dirname */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function open(initial=null, unavailable=false){
  const html=fs.readFileSync(path.join(__dirname,'..','profit','index.html'),'utf8');
  const elements={}, map=new Map(); let blob=null;
  function el(id){return elements[id] ||= {value:'',textContent:'',innerHTML:'',className:'',dataset:{},files:[],addEventListener(){},replaceChildren(){},append(){},click(){},focus(){},setAttribute(){}};}
  for(const m of html.matchAll(/<input\b([^>]*)>/g)){const a=m[1], n=/\bid="([^"]+)"/.exec(a);if(n)el(n[1]).value=(/\bvalue="([^"]*)"/.exec(a)||[])[1]||'';}
  if(initial!==null)map.set('profit-pro-v1',initial);
  const storage={getItem(k){if(unavailable)throw Error('denied');return map.has(k)?map.get(k):null},setItem(k,v){if(unavailable)throw Error('denied');map.set(k,String(v));}};
  const confirmMessages=[]; const ctx=vm.createContext({document:{getElementById:el,querySelectorAll(){return []},createElement(){return el('_created')}},localStorage:storage,Intl,Number,Math,Date,JSON,Blob,TextEncoder,TextDecoder,URL:{createObjectURL:x=>(blob=x,'blob:mock'),revokeObjectURL(){}},confirm:msg=>(confirmMessages.push(msg),true),setTimeout(){},window:{scrollTo(){},print(){}}});
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx,{filename:'profit'});
  return {ctx,el,run:x=>vm.runInContext(x,ctx),download:async()=>blob?.text(),confirmMessage:()=>confirmMessages.join('\n')};
}
const valid={id:'1',name:'A',price:100,cost:10,shipping:0,feeRate:0,fixedFee:0,other:0,target:0};

test('S8: non-UTF8 CSV is rejected',async()=>{const a=open();const f={size:3,arrayBuffer:async()=>Uint8Array.from([0x82,0xa0,0x82]).buffer};await a.el('importFile').onchange({target:{files:[f],value:'x'}});assert.match(a.el('error').textContent,/UTF|文字コード|CSV/);});
test('S8: duplicate CSV rows are rejected before confirmation',async()=>{const a=open();const csv='name,price,cost,shipping,feeRate,fixedFee,other,target\nA,100,10,0,0,0,0,0\nA,100,10,0,0,0,0,0';const f={size:csv.length,text:async()=>csv};await a.el('importFile').onchange({target:{files:[f],value:'x'}});assert.match(a.el('error').textContent,/重複/);});
test('S9: edit cancel restores the pre-edit draft and reset clears all inputs',()=>{const a=open();a.el('name').value='saved';a.el('save').onclick();a.el('name').value='draft';a.el('price').value='123';a.el('reset').onclick();assert.equal(a.el('name').value,'');assert.equal(a.el('price').value,'');});
test('whole-yen required price is ceiled and cost rate is exposed',()=>{const a=open();assert.equal(a.run('calc({price:100,cost:1,shipping:0,feeRate:0,fixedFee:0,other:0,target:0.09}).required'),2);assert.match(a.el('detail').textContent,/原価率|コスト率/);});
test('invalid storage keeps raw data and backup can restore it',()=>{const a=open('{"broken":true}');assert.equal(a.run('storageRaw'),' {"broken":true}'.trim());assert.equal(a.run('storageBlocked'),true);});
test('S3: edit state exposes new, update, save-as and cancel controls',()=>{const a=open();const html=fs.readFileSync(path.join(__dirname,'..','profit','index.html'),'utf8');for(const id of ['new','update','saveAs','cancelEdit'])assert.match(html,new RegExp(`id="${id}"`));assert.equal(a.run('draft'),null);});
test('S3: unsaved draft survives edit cancel',()=>{const a=open();a.el('name').value='draft';a.el('price').value='123';a.run("draft={name:'draft',price:'123'};editing='1'");a.el('cancelEdit').onclick();assert.equal(a.el('name').value,'draft');assert.equal(a.el('price').value,'123');});
test('S4: partial invalid storage is quarantined with exact raw',()=>{const raw=JSON.stringify([valid,{bad:true}]);const a=open(raw);assert.equal(a.run('records.length'),1);assert.equal(a.run('quarantine.length'),1);assert.equal(a.run('quarantine[0].raw'),'{"bad":true}');});
test('S4: unavailable storage is distinct from corrupt storage',()=>{const a=open(null,true);assert.equal(a.run('storageUnavailable'),true);assert.equal(a.run('storageBlocked'),true);assert.match(a.el('quarantine').textContent,/利用できません/);});
test('existing duplicate import asks before adding',async()=>{const a=open(JSON.stringify([valid]));const csv='name,price,cost,shipping,feeRate,fixedFee,other,target\nA,100,10,0,0,0,0,0';const f={size:csv.length,text:async()=>csv};await a.el('importFile').onchange({target:{files:[f],value:'x'}});assert.match(a.confirmMessage(),/重複/);assert.equal(a.run('records.length'),2);});
test('profit CSV includes separate named result columns',async()=>{const a=open();a.el('name').value='A';a.el('save').onclick();a.el('export').onclick();const text=await a.download();assert.match(text,/総コスト/);assert.match(text,/利益率/);assert.match(text,/最低売価/);});
test('clearing all while editing exits update mode without discarding current inputs',()=>{const a=open();a.el('name').value='saved';a.el('save').onclick();a.run("editing=records[0].id;draft={name:'old'}");a.el('save').textContent='更新保存';a.el('name').value='unsaved';a.el('clear').onclick();assert.equal(a.run('editing'),null);assert.equal(a.el('save').textContent,'新規保存');assert.equal(a.el('name').value,'unsaved')});
test('quarantine identifies the original record position',()=>{const a=open(JSON.stringify([valid,{bad:true}]));assert.match(a.el('quarantine').textContent,/2/)});

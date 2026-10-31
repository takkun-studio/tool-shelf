/* global require, process */
/* eslint @typescript-eslint/no-require-imports: off */
const {chromium}=require(process.env.QA_PLAYWRIGHT_MODULE||'playwright');
const ids=['breakeven','channel','discount','inventory','investment','market','payout','profit','service','target'];
(async()=>{const browser=await chromium.launch(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{ });let fail=0;
for(const id of ids){const c=await browser.newContext();const p=await c.newPage();let accept=true,messages=[];p.on('dialog',async d=>{messages.push(d.message());if(accept)await d.accept();else await d.dismiss()});const r={};let error='';try{
await p.goto(`${process.env.QA_BASE_URL||'http://127.0.0.1:18763'}/standalone-pro/v3/${id}/`);
const row=p.locator(id==='profit'?'#items tr':'#history tr');const edit=()=>row.first().locator(id==='profit'?'button.secondary':'[data-edit]');
await p.locator('#name').fill('saved');await p.locator('#save').click();await p.locator('#name').fill('original draft');await edit().click();const editStatus=p.locator(id==='profit'?'#editStatus':'#status');r.editVisible=await editStatus.count()===1&&/編集中/.test(await editStatus.innerText());await p.locator('#name').fill('unsaved edit');messages=[];accept=false;await edit().click();r.cancelSwitch=(await p.locator('#name').inputValue())==='unsaved edit';r.switchWarns=messages.some(m=>/破棄|失われ/.test(m));accept=true;await p.locator('#cancelEdit').click();r.draftRestored=(await p.locator('#name').inputValue())==='original draft';
await edit().click();await p.locator('#name').fill('copy');await p.locator(id==='profit'?'#saveAs':'#saveCopy').click();r.copy=(await row.count())===2&&(await row.first().innerText()).includes('saved');
if(id==='profit'){await p.locator('#name').fill('unsaved new');messages=[];accept=false;await p.locator('#new').click();r.cancelReset=(await p.locator('#name').inputValue())==='unsaved new';r.resetWarns=messages.length>0;accept=true;await edit().click();await p.locator('#name').fill('unsaved after clear');await p.locator('#clear').click();r.clearKeepsDraft=(await p.locator('#name').inputValue())==='unsaved after clear'&&(await p.locator('#save').innerText()).includes('新規');}
}catch(e){error=String(e)}const ok=!error&&Object.values(r).every(Boolean);if(!ok)fail++;console.log(JSON.stringify({id,ok,r,error}));await c.close()}
await browser.close();if(fail)process.exitCode=1})().catch(e=>{console.error(e);process.exitCode=1});

/* global require, process, Buffer */
/* eslint @typescript-eslint/no-require-imports: off */
const {chromium}=require(process.env.QA_PLAYWRIGHT_MODULE||'playwright');
const ids=['breakeven','channel','discount','inventory','investment','market','payout','profit','service','target'];
(async()=>{const browser=await chromium.launch(process.env.QA_CHROMIUM_PATH?{executablePath:process.env.QA_CHROMIUM_PATH}:{});let fail=0;
for(const id of ids){const c=await browser.newContext({acceptDownloads:true});const p=await c.newPage();p.on('dialog',d=>d.accept());let checks={},error='';
async function tabTo(sel){const target=p.locator(sel).first();for(let n=0;n<80;n++){if(await target.evaluate(e=>document.activeElement===e))return;await p.keyboard.press('Tab')}throw Error('Tabで到達できません: '+sel)}
async function activate(sel){await tabTo(sel);await p.keyboard.press('Enter')}
try{await p.goto(`${process.env.QA_BASE_URL||'http://127.0.0.1:18763'}/standalone-pro/v3/${id}/`);await tabTo('#name');await p.keyboard.press('Meta+A');await p.keyboard.type('keyboard');await activate('#save');const rows=p.locator(id==='profit'?'#items tr':'#history tr');checks.save=await rows.count()===1;
const edit=id==='profit'?'#items tr:first-child button.secondary':'#history tr:first-child [data-edit]';await activate(edit);checks.edit=await p.locator(id==='profit'?'#editStatus':'#status').innerText().then(x=>x.includes('編集中'));await activate('#cancelEdit');checks.cancel=(await p.locator('#name').inputValue())==='keyboard';
await activate(edit);await tabTo('#name');await p.keyboard.press('Meta+A');await p.keyboard.type('copy');await activate(id==='profit'?'#saveAs':'#saveCopy');checks.saveAs=await rows.count()===2;
let dl=p.waitForEvent('download');await activate('#export');const csv=await dl;checks.csv=!!csv.suggestedFilename();dl=p.waitForEvent('download');await activate('#backup');const backup=await dl;const stream=await backup.createReadStream();let chunks=[];for await(const x of stream)chunks.push(x);const data=Buffer.concat(chunks);
await activate(id==='profit'?'#items tr:last-child button.danger':'#history tr:last-child [data-delete]');checks.delete=await rows.count()===1;
const selector=id==='profit'?'#restoreButton':'#restore';await tabTo(selector);const chooser=p.waitForEvent('filechooser');await p.keyboard.press('Enter');const fc=await chooser;await fc.setFiles({name:'backup.json',mimeType:'application/json',buffer:data});await p.waitForFunction(sel=>document.querySelectorAll(sel).length===2,id==='profit'?'#items tr':'#history tr');checks.restore=await rows.count()===2;
await p.evaluate(()=>{window.__printed=false;window.print=()=>window.__printed=true});await activate(id==='profit'?'#print':'button[onclick="window.print()"]');checks.print=await p.evaluate(()=>window.__printed);
}catch(e){error=String(e).slice(0,300)}const ok=!error&&Object.keys(checks).length===8&&Object.values(checks).every(Boolean);if(!ok)fail++;console.log(JSON.stringify({id,ok,checks,error}));await c.close()}
await browser.close();if(fail)process.exitCode=1})().catch(e=>{console.error(e);process.exitCode=1});

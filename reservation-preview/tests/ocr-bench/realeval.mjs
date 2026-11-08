// 実筆跡（IngCrowd office memo, 57人）での文字認識率
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_DIR ? pathToFileURL(process.env.PLAYWRIGHT_DIR + '/index.mjs').href : 'playwright');
import http from 'node:http'; import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const [dir, browserName='chromium', engine='paddle'] = process.argv.slice(2);
const IMG=path.resolve(dir), BENCH=path.dirname(fileURLToPath(import.meta.url)),SITE=path.resolve(process.env.SITE_DIR||path.join(BENCH,'../../.site'));
const TRUTH='明日の会議は午後3時からです。資料をコピーして、受付に置いてください。';
const norm=s=>String(s).normalize('NFKC').replace(/[\s。、.,，．・「」]/g,'');
function lev(a,b){a=[...a];b=[...b];const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
const ctx={};vm.createContext(ctx);vm.runInContext(readFileSync(path.join(SITE,'ocr/ocr-parse.js'),'utf8'),ctx);const P=ctx.KaisekiOcrParse;
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm'};
const srv=http.createServer((q,s)=>{const u=decodeURIComponent(new URL(q.url,'http://x').pathname);const f=u.startsWith('/img/')?path.join(IMG,u.slice(5)):u==='/harness.html'?path.join(BENCH,'harness.html'):path.join(SITE,u);if(!existsSync(f)||statSync(f).isDirectory()){s.writeHead(404);return s.end()}s.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});s.end(readFileSync(f))});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${srv.address().port}`;
const b=await (browserName==='webkit'?webkit.launch():chromium.launch(process.env.PW_CHANNEL?{channel:process.env.PW_CHANNEL}:{}));const page=await b.newPage();await page.goto(base+'/harness.html');
const files=readdirSync(IMG).filter(f=>f.endsWith('.jpg')).sort();
let edits=0,total=0,exact=0,timeOk=0,nedits=0;const per=[];
for(const f of files){const url=`${base}/img/${f}`;const out=engine==='tess'?await page.evaluate(u=>window.runTess(u),url):await page.evaluate(u=>window.runPaddle(u,{}).then(r=>({text:r.text})),url);
  const got=norm(out.text),t=norm(TRUTH),e=lev(got,t);edits+=e;nedits+=lev(norm(out.text.split('\n').map(l=>P.normalizeLine(l)).join('')),t);total+=[...t].length;if(e===0)exact++;
  const st=P.parseLine(out.text.replace(/\n/g,' '),{baseDate:'2026-11-09'});const tm=st&&st.start&&st.start.value==='15:00';if(tm)timeOk++;
  per.push({file:f,cer:+(e/[...t].length).toFixed(3),text:out.text.replace(/\n/g,' / ')});process.stderr.write(`${f} CER ${(e/[...t].length*100).toFixed(1)}% ${tm?'15:00':'-'} ${out.text.replace(/\n/g,' / ')}\n`)}
await b.close();srv.close();
const sum={engine,browser:browserName,images:files.length,charAccuracy:((1-edits/total)*100).toFixed(1)+'%',cer:(edits/total*100).toFixed(1)+'%',charAccuracyAfterAppNormalize:((1-nedits/total)*100).toFixed(1)+'%',perfectImages:exact,time15Detected:`${timeOk}/${files.length}`};
writeFileSync(path.join(IMG,`real-${engine}-${browserName}.json`),JSON.stringify({sum,per},null,1));console.log(JSON.stringify(sum));

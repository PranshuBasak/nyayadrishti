const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const key=fs.readFileSync('.env.local','utf8').match(/^GEMINI_API_KEY=(.*)$/m)?.[1].trim().replace(/^["']|["']$/g,'');
const hits=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.js')&&key&&fs.readFileSync(f,'utf8').includes(key))hits.push(f);}}walk('.next/static');assert.equal(hits.length,0,'No server key in client bundles');
(async()=>{
 for(const [body,expected] of [[{},400],[{prompt:'x'.repeat(100001)},400],[{prompt:'test',imageBase64:'invalid',mimeType:'text/html'},400]]){
  const r=await fetch('http://localhost:3000/api/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,expected);const d=await r.json();assert.equal(typeof d.error,'string');assert.equal(d.text,undefined,'Failures do not fabricate legal answers');
 }
 assert.equal((await fetch('http://localhost:3000/pdf.worker.min.js')).status,200);
 assert.equal((await fetch('http://localhost:3000/api/legal-crawler?q=')).status,400);
 console.log('PASS: production responds, local PDF worker available, invalid requests rejected, no fabricated fallback, no API key in browser bundles.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});

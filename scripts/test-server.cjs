const fs=require('fs'), ts=require('typescript'), assert=require('node:assert/strict');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
const {createGenerator,classifyFailure,validateInput}=require('../src/lib/server/gemini.ts');
const {guard,readJson}=require('../src/lib/server/guard.ts');
const {credentials,orderedCredentials}=require('../src/lib/server/credentials.ts');
const {liveContext,supportsLiveSpeech}=require('../src/lib/live/config.ts');
const signal=new AbortController().signal;
const good={candidates:[{finishReason:'STOP',content:{parts:[{text:'Grounded in supplied facts.'}]}}]};
const response=(data,status=200)=>new Response(JSON.stringify(data),{status});
const quota={error:{details:[{violations:[{quotaId:'PerDay',quotaDimensions:{model:'gemini-3.5-flash-lite'}}]}]}};
(async()=>{
 let calls=[],retry=0,now=0,total=0; const generator=createGenerator(async(url,options)=>{calls.push({url,key:options.headers['x-goog-api-key']});return ++total===1?response(quota,429):response(good)},()=>now);
 const result=await generator({prompt:'Question'},['test-a','test-b'],signal,()=>retry++);
 assert.equal(result.modelUsed,'gemini-3.1-flash-lite');assert.equal(calls.length,2);assert.equal(retry,1);assert.equal(calls[1].key,'test-b');
 calls=[];await generator({prompt:'Question'},'test-a',signal);assert.match(calls[0].url,/gemini-3.1-flash-lite/,'cooled primary skipped');
 for(const status of [400,401,403]) { let n=0; const g=createGenerator(async()=>{n++;return response({error:{message:'do not expose secret'}},status)});await assert.rejects(()=>g({prompt:'q'},'test',signal));assert.equal(n,1); }
 for(const data of [{error:{message:'Project spending limit'}},{error:{message:'Search grounding quota',details:quota.error.details}}]) {let n=0;const g=createGenerator(async()=>{n++;return response(data,429)});await assert.rejects(()=>g({prompt:'q'},'test',signal));assert.equal(n,1);}
 let n=0;await assert.rejects(()=>createGenerator(async()=>{n++;return response({},503)})({prompt:'q'},'test',signal));assert.equal(n,2,'two attempt maximum');
 await assert.rejects(()=>createGenerator(async()=>response(good))({prompt:'q',research:true},'test',signal),/AI_GROUNDING_UNAVAILABLE/);
 n=0;await assert.rejects(()=>createGenerator(async()=>{n++;return response({candidates:[{finishReason:'SAFETY'}]})})({prompt:'q'},'test',signal),/AI_SAFETY/);assert.equal(n,1);
 const withSources=structuredClone(good);withSources.candidates[0].groundingMetadata={groundingChunks:[{web:{uri:'https://example.gov/legal',title:'Official'}},{web:{uri:'javascript:bad'}}]};
 assert.equal((await createGenerator(async()=>response(withSources))({prompt:'q',research:true},'test',signal)).sources.length,1);
 assert.equal(classifyFailure(429,quota).retry,true);assert.equal(classifyFailure(429,{error:{message:'Project disabled',details:quota.error.details}}).retry,false);
 assert.throws(()=>validateInput({prompt:'q',imageBase64:'<script>',mimeType:'image/png'}));assert.throws(()=>validateInput({prompt:'q',research:'yes'}));assert.throws(()=>validateInput({prompt:'x'.repeat(100001)}));
 await assert.rejects(()=>readJson(new Request('http://localhost',{method:'POST',body:'x'.repeat(101)}),100),/REQUEST_TOO_LARGE/);
 assert.throws(()=>guard(new Request('http://localhost/api',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'}}),'live'),/INVALID_ORIGIN/);
 const req=()=>new Request('http://localhost/api',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'}});
 guard(req(),'live')();guard(req(),'live')();assert.throws(()=>guard(req(),'live'),/AI_RATE_LIMIT/);
 process.env.GEMINI_API_KEY='test-primary';process.env.GEMINI_API_KEY2='test-primary';process.env.GEMINI_API_KEY3='test-other';assert.equal(credentials().length,2);assert.notEqual(orderedCredentials()[0],orderedCredentials()[0]);
 assert.ok(liveContext('x'.repeat(1000),'x'.repeat(30000),'x'.repeat(30000),'x'.repeat(30000),'x'.repeat(30000)).length<=24000);assert.equal(supportsLiveSpeech('sa'),false);assert.equal(supportsLiveSpeech('hi'),true);
 console.log('PASS: fallback ordering, key deduplication/rotation, cooldown, two-attempt cap, no auth/safety/project-quota retries, grounding, payload limits, origin checks, token rate limit, bounded Live context.');
})().catch(e=>{console.error(e);process.exitCode=1});

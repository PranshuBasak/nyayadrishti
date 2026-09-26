const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module'),vm=require('vm');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
let connections=[],audio; class FakeAudio {constructor(){audio=this;this.interrupts=0;this.closed=false;this.played=[];}async prepare(){}async capture(fn){this.send=fn;}mute(v){this.muted=v;}play(v){this.played.push(v);}interrupt(){this.interrupts++;}close(){this.closed=true;}}
class FakeAI { constructor(){} live={connect:async options=>{const session={options,sent:[],closed:false,sendRealtimeInput(value){this.sent.push(value)},close(){this.closed=true}};connections.push(session);return session;}};}
const originalLoad=Module._load;Module._load=function(name,parent,...rest){if(parent?.filename.endsWith('live\\session.ts')||parent?.filename.endsWith('live/session.ts')){if(name==='@google/genai')return{GoogleGenAI:FakeAI,Modality:{AUDIO:'AUDIO'}};if(name==='./audio')return{LiveAudio:FakeAudio};}return originalLoad.call(this,name,parent,...rest);};
const {LiveConversation}=require('../src/lib/live/session.ts');
let interval,cleared=false;const realInterval=global.setInterval,realClear=global.clearInterval;global.setInterval=fn=>(interval=fn,123);global.clearInterval=()=>{cleared=true};
global.fetch=async()=>Response.json({token:'synthetic-token',model:'gemini-3.8-live',expiresAt:new Date(Date.now()+300000).toISOString()});
(async()=>{
 const states=[],transcripts=[],errors=[];const c=new LiveConversation({status:s=>states.push(s),captions:()=>{},transcript:(...args)=>transcripts.push(args),error:e=>errors.push(e),remaining:()=>{}});
 await c.start('en','Synthetic context');assert.equal(states.at(-1),'connected');audio.send('input');assert.equal(connections[0].sent[0].audio.mimeType,'audio/pcm;rate=16000');
 c.mute(true);assert.equal(audio.muted,true);assert.equal(connections[0].sent.at(-1).audioStreamEnd,true);c.frame('jpeg');assert.equal(connections[0].sent.at(-1).video.mimeType,'image/jpeg');
 const receive=connections[0].options.callbacks.onmessage;
 receive({serverContent:{inputTranscription:{text:'What is rent?'},outputTranscription:{text:'Rent is 10000.'},modelTurn:{parts:[{inlineData:{data:'one',mimeType:'audio/pcm;rate=24000'}},{inlineData:{data:'two',mimeType:'audio/pcm;rate=24000'}}]}}});assert.equal(audio.played.length,2,'all parts played');
 receive({serverContent:{interrupted:true}});assert.equal(audio.interrupts,1);assert.equal(transcripts.length,2);assert.equal(transcripts[1][3],true);
 receive({serverContent:{turnComplete:true}});assert.equal(transcripts.length,2,'empty duplicate completion is ignored');
 receive({sessionResumptionUpdate:{resumable:true,newHandle:'test-handle'}});connections[0].options.callbacks.onclose({code:1006});await new Promise(setImmediate);
 assert.equal(connections.length,2);assert.equal(connections[1].options.config.sessionResumption.handle,'test-handle');assert.equal(connections[1].sent.length,0,'no audio replay');
 connections[1].options.callbacks.onclose({code:1006});assert.equal(connections.length,2,'only one reconnect');assert.equal(audio.closed,true);assert.equal(cleared,true);assert.equal(states.at(-1),'ended');assert.ok(errors.includes('LIVE_DISCONNECTED'));
 const before=transcripts.length;receive({serverContent:{outputTranscription:{text:'late'},turnComplete:true}});assert.equal(transcripts.length,before,'late messages ignored');
 // Execute the real AudioWorklet with synthetic 48 kHz samples and inspect PCM output.
 let Processor,posted=[];const context={AudioWorkletProcessor:class{constructor(){this.port={postMessage:value=>posted.push(value)}}},sampleRate:48000,Int16Array,registerProcessor:(_,value)=>Processor=value};vm.runInNewContext(fs.readFileSync('public/pcm-capture.js','utf8'),context);
 const processor=new Processor();for(let i=0;i<10;i++)processor.process([[new Float32Array(480).fill(.5)]]);assert.equal(posted.length,1);assert.equal(new Int16Array(posted[0]).length,1600);assert.equal(new Int16Array(posted[0])[0],16383);
 console.log('PASS: synthetic Live audio transport, every output part, interruption, transcript deduplication, mute, frames, one resumable reconnect, no replay, cleanup, late-event protection, 48k-to-16k PCM resampling.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.setInterval=realInterval;global.clearInterval=realClear;Module._load=originalLoad;});

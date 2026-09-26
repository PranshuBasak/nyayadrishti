// Real provider smoke check with synthetic text. Never prints tokens or credentials.
const fs = require('node:fs');
const { GoogleGenAI, Modality } = require('@google/genai');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
const model = 'gemini-3.8-live';
(async () => {
 const server = new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion:'v1beta' } });
 let token;
 try { token = await server.authTokens.create({ config:{ uses:1,expireTime:new Date(Date.now()+60000).toISOString(),newSessionExpireTime:new Date(Date.now()+30000).toISOString(),abortSignal:AbortSignal.timeout(15000),liveConnectConstraints:{model,config:{responseModalities:[Modality.AUDIO],inputAudioTranscription:{},outputAudioTranscription:{},contextWindowCompression:{slidingWindow:{}},maxOutputTokens:2048,systemInstruction:'Synthetic test. The rent is INR 10000. Reply briefly in English.'}}} }); }
 catch(error) {console.log(JSON.stringify({tokenCreated:false,status:error.status||null}));process.exitCode=1;return;}
 console.log(JSON.stringify({tokenCreated:Boolean(token.name),model}));
 const ai = new GoogleGenAI({apiKey:token.name,httpOptions:{apiVersion:'v1beta'}});
 let session, audio=0, transcript='', done;
 const completed = new Promise(resolve=>{done=resolve});
 const timeout=setTimeout(()=>done('timeout'),20000);
 try {
  session=await ai.live.connect({model,config:{responseModalities:[Modality.AUDIO],sessionResumption:{},abortSignal:AbortSignal.timeout(15000)},callbacks:{onmessage:m=>{for(const p of m.serverContent?.modelTurn?.parts||[])if(p.inlineData?.mimeType?.startsWith('audio/pcm'))audio++;transcript+=m.serverContent?.outputTranscription?.text||'';if(m.serverContent?.turnComplete)done('complete')},onclose:e=>done('closed-'+e.code),onerror:()=>done('error')}});
  if(process.argv.includes('--vision')) session.sendRealtimeInput({video:{data:fs.readFileSync('tests/fixtures/sample-receipt.png').toString('base64'),mimeType:'image/png'}});
  session.sendClientContent({turns:[{role:'user',parts:[{text:process.argv.includes('--vision')?'Read the date and amount on the synthetic receipt image.':'What is the monthly rent in the supplied synthetic context?'}]}],turnComplete:true});
  const status=await completed;console.log(JSON.stringify({status,audioChunks:audio,transcript}));if(status!=='complete'||!audio)process.exitCode=1;
 }catch(error){console.log(JSON.stringify({connection:false,status:error.status||null}));process.exitCode=1;}
 finally{clearTimeout(timeout);session?.close();}
})().catch(()=>{console.log('Live probe failed');process.exitCode=1});

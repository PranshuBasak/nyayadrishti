const fs = require('node:fs');
const additions = {
 tryingModel: 'Trying another available model…', quotaLimit: 'The provider quota or request limit has been reached. Please retry later.',
 liveTitle: 'Talk with Nyaya Live', liveHint: 'A real-time conversation about your document. You can interrupt at any time.',
 liveStart: 'Start live conversation', liveEnd: 'End conversation', liveMute: 'Mute microphone', liveUnmute: 'Unmute microphone',
 liveTime: 'Time remaining', liveConnecting: 'Connecting securely…', liveConnected: 'Listening — speak naturally', liveMuted: 'Microphone muted',
 liveReconnecting: 'Reconnecting — audio is paused', liveEnded: 'Conversation ended. Start again to use the current document and language.',
 liveReady: 'Five-minute session · camera and screen sharing are optional', liveStopSharing: 'Stop sharing', liveYou: 'You',
 livePrivacy: 'Starting sends selected document context and microphone audio to Google Gemini. Camera or screen frames are sent only when sharing is enabled. Captions stay in this browser; raw audio and video are not saved.',
 liveLanguageUnavailable: 'Live speech is not available for this language. Continue using text chat or select another language.',
 liveExpired: 'The five-minute session has ended. You can start a new conversation.',
 liveDisconnected: 'The live connection ended. Restart to continue; microphone audio was not replayed.',
 liveUnavailable: 'Gemini Live is unavailable. Please check model access and quota, or continue in text chat.',
 liveInterrupted: 'Reply interrupted', aiAuthError: 'The AI credential is unavailable. The site owner needs to check the server configuration.',
 groundingUnavailable: 'Verified search results are unavailable. Please retry later or use the official source links.',
 aiSafety: 'The provider could not answer this request. Rephrase your question with the relevant document facts.'
};
const enFile='src/locales/en.json'; fs.writeFileSync(enFile,JSON.stringify({...JSON.parse(fs.readFileSync(enFile)),...additions},null,2)+'\n');
const env=fs.readFileSync('.env.local','utf8');
const keys=Array.from(new Set([...env.matchAll(/^GEMINI_API_KEY[2-5]?=(.*)$/gm)].map(m=>m[1].trim().replace(/^["']|["']$/g,'')))).filter(Boolean);
const targets=[['hi','Hindi'],['bn','Bengali'],['te','Telugu'],['mr','Marathi'],['ta','Tamil'],['ur','Urdu'],['gu','Gujarati'],['kn','Kannada'],['ml','Malayalam'],['or','Odia'],['pa','Punjabi Gurmukhi'],['as','Assamese'],['ne','Nepali'],['sa','Sanskrit']];
(async()=>{let index=0;for(const [code,name] of targets){
 const file=`src/locales/${code}.json`, old=JSON.parse(fs.readFileSync(file));
 const missing=Object.fromEntries(Object.entries(additions).filter(([k])=>!old[k])); if(!Object.keys(missing).length)continue;
 const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':keys[index++%keys.length]},signal:AbortSignal.timeout(55000),body:JSON.stringify({contents:[{parts:[{text:`Translate all values in this UI dictionary into natural ${name} using its native script. Keep JSON keys identical. Preserve Google Gemini and Nyaya as product names. Do not add claims. Return JSON only.\n${JSON.stringify(missing)}`}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:6000,thinkingConfig:{thinkingLevel:'minimal'}}})});
 const data=await r.json(); if(!r.ok)throw Error(`${code}: provider status ${r.status}`);
 const translated=JSON.parse(data.candidates?.[0]?.content?.parts?.filter(p=>p.text&&!p.thought).map(p=>p.text).join(''));
 for(const k of Object.keys(missing))if(typeof translated[k]!=='string'||!translated[k].trim())throw Error(`${code}: missing ${k}`);
 fs.writeFileSync(file,JSON.stringify({...old,...translated},null,2)+'\n');console.log(`${code}: ${Object.keys(missing).length} new labels translated`);
}})().catch(e=>{console.error(e.message);process.exitCode=1});

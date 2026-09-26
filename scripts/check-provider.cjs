const fs = require('fs');
const key = fs.readFileSync('.env.local', 'utf8').match(/^GEMINI_API_KEY=(.*)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
fetch('https://generativelanguage.googleapis.com/v1beta/models', {headers: {'x-goog-api-key': key}, signal: AbortSignal.timeout(15000)})
  .then(async r => {const d = await r.json(); console.log(JSON.stringify({status:r.status,error:d.error?.status,models:d.models?.filter(m=>m.supportedGenerationMethods?.includes('generateContent')).map(m=>m.name)}));})
  .catch(e => console.log(e.message));

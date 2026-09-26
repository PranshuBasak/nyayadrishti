const fs = require('fs');
const path = require('path');
const key = fs.readFileSync('.env.local', 'utf8').match(/^GEMINI_API_KEY=(.*)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
const source = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const targets = [['hi','Hindi'],['bn','Bengali'],['te','Telugu'],['mr','Marathi'],['ta','Tamil'],['ur','Urdu'],['gu','Gujarati'],['kn','Kannada'],['ml','Malayalam'],['or','Odia'],['pa','Punjabi in Gurmukhi script'],['as','Assamese'],['ne','Nepali'],['sa','Sanskrit']];
async function translate([code, name]) {
  const file = path.join('src/locales', code + '.json');
  if (fs.existsSync(file) && Object.keys(JSON.parse(fs.readFileSync(file))).length === Object.keys(source).length) return;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', {
      method: 'POST', headers: {'Content-Type': 'application/json', 'x-goog-api-key': key}, signal: AbortSignal.timeout(90000),
      body: JSON.stringify({contents:[{parts:[{text:`Translate this complete UI dictionary into natural ${name}, native script, for a legal document preparation app. Keep every JSON key identical. Preserve the name Nyaya and technical proper names PDF, TXT, Google Gemini. Translate all values including errors, hints and headings. Concise, understandable language, no new legal claims. Return only a JSON object.\n${JSON.stringify(source)}`}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:16000,thinkingConfig:{thinkingBudget:0}}})
    });
    const d = await r.json();
    try {
      const translated = JSON.parse(d.candidates[0].content.parts.filter(p=>p.text).map(p=>p.text).join(''));
      if (Object.keys(source).some(k=>typeof translated[k] !== 'string' || !translated[k].trim())) throw Error('Missing keys');
      fs.writeFileSync(file, JSON.stringify(translated,null,2)+'\n');
      console.log(code + ': ' + Object.keys(translated).length + ' translated strings'); return;
    } catch { console.log(code + ': retry, status ' + r.status); await new Promise(resolve=>setTimeout(resolve,45000)); }
  }
  throw Error('Translation failed: ' + code);
}
(async()=>{for(let i=0;i<targets.length;i+=2) await Promise.all(targets.slice(i,i+2).map(translate));})().catch(e=>{console.error(e.message);process.exitCode=1});

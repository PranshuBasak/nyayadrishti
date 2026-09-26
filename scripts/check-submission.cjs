const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const git=(args)=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:16000000}).trim();
const files=git(['ls-files']).split('\n').filter(Boolean);
const secretPattern=/AIza[\w-]{30,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
let bytes=0;
for(const file of files){assert.ok(!/(^|\/)(node_modules|\.next|\.open-next|\.wrangler|dist)\//.test(file),'Build/dependency file tracked: '+file);assert.ok(!/(^|\/)\.env(?!\.example$)/.test(file),'Secret env file tracked');const b=fs.readFileSync(file);bytes+=b.length;assert.ok(!secretPattern.test(b.toString()),'Possible secret in '+file);}
assert.ok(bytes<10000000,'Tracked files must stay below 10 MB');
const objects=git(['rev-list','--objects','--all']).split('\n').map(line=>line.split(' ')[0]);
let historyBytes=0;
for(const object of objects){const type=git(['cat-file','-t',object]);historyBytes+=Number(git(['cat-file','-s',object]));if(type==='blob')assert.ok(!secretPattern.test(git(['cat-file','-p',object])),'Possible secret in history');}
assert.ok(historyBytes<10000000,'Uncompressed history must stay below 10 MB');
assert.deepEqual(git(['branch','--format=%(refname:short)']).split('\n'),['main'],'One local branch');
console.log(JSON.stringify({files:files.length,trackedBytes:bytes,historyBytes,branch:'main',secretScan:'passed'}));

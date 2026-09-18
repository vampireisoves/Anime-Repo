// 混淆 index.html 内联脚本（读 index.src.html → 写 index.html）
// 用法: node build/obfuscate.js （项目根目录执行）
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const repo = path.join(__dirname, '..');
const srcFile = path.join(repo, 'index.src.html');
const outFile = path.join(repo, 'index.html');
const src = fs.readFileSync(srcFile, 'utf-8');

const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m, count = 0;
let out = src;
while ((m = re.exec(src)) !== null) {
  const code = m[1];
  const obf = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    identifierNamesGenerator: 'hexadecimal',
    stringArray: true,
    stringArrayThreshold: 0.75,
    rotateStringArray: true,
    selfDefending: false,
    disableConsoleOutput: false,
    numbersToExpressions: false,
  }).getObfuscatedCode();
  out = out.replace(m[0], m[0].split(code).join(obf));
  count++;
  console.log('obfuscated block', count, code.length, '->', obf.length);
}
fs.writeFileSync(outFile, out);
console.log('DONE -> ' + outFile);

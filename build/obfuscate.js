// 混淆两个页面内联脚本（index.src.html→index.html, play.src.html→play.html）
// 用法: node build/obfuscate.js （项目根目录执行）
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const repo = path.join(__dirname, '..');
const files = [
  { src: 'index.src.html', dst: 'index.html' },
  { src: 'play.src.html', dst: 'play.html' },
];

const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

files.forEach(f => {
  const srcFile = path.join(repo, f.src);
  const outFile = path.join(repo, f.dst);
  const src = fs.readFileSync(srcFile, 'utf-8');
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
    console.log('obfuscated', f.src, 'block', count, code.length, '->', obf.length);
  }
  fs.writeFileSync(outFile, out);
  console.log('DONE', f.src, '->', f.dst);
});

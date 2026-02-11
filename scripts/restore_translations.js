const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'i18n', 'translations.ts');
const backupPath = filePath + '.bak';
const src = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, src, 'utf8');
console.log('Backup saved to', backupPath);

function findObjectLiteral(source, key) {
  const keyIndex = source.indexOf(key + ':');
  if (keyIndex === -1) return null;
  const braceIndex = source.indexOf('{', keyIndex);
  if (braceIndex === -1) return null;
  let i = braceIndex;
  let depth = 0;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(braceIndex, i + 1);
    }
  }
  return null;
}

function toObject(literal) {
  try {
    return eval('(' + literal + ')');
  } catch (e) {
    console.error('Eval error:', e);
    return null;
  }
}

const ptLiteral = findObjectLiteral(src, 'pt');
if (!ptLiteral) { console.error('pt block not found'); process.exit(1); }
const ptObj = toObject(ptLiteral);
if (!ptObj) { console.error('failed to parse pt'); process.exit(1); }

function stringify(obj){
  // produce JS-friendly object literal: keys unquoted and single quotes for strings
  const json = JSON.stringify(obj, null, 2);
  const withoutQuotesKeys = json.replace(/"([^(")]+)":/g, '$1:');
  const singleQuotes = withoutQuotesKeys.replace(/"/g, "'");
  return singleQuotes;
}

const ptStr = stringify(ptObj);
const newContent = `export type Language = 'pt' | 'en' | 'es';\n\nexport const translations = {\n  pt: ${ptStr},\n  en: ${ptStr},\n  es: ${ptStr},\n};\n`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('translations.ts restored with pt copied to en and es.');

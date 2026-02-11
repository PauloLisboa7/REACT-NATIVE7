const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'i18n', 'translations.ts');
let src = fs.readFileSync(filePath, 'utf8');

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
  // Wrap in parentheses to eval safely as expression
  try {
    return eval('(' + literal + ')');
  } catch (e) {
    console.error('Eval error:', e);
    return null;
  }
}

function mergeDeep(base, override) {
  if (typeof base !== 'object' || base === null) return override;
  const out = Array.isArray(base) ? [] : {};
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(override || {})]);
  keys.forEach((k) => {
    if (override && Object.prototype.hasOwnProperty.call(override, k)) {
      if (typeof override[k] === 'object' && override[k] !== null && base[k] && typeof base[k] === 'object') {
        out[k] = mergeDeep(base[k], override[k]);
      } else {
        out[k] = override[k];
      }
    } else {
      out[k] = base[k];
    }
  });
  return out;
}

function stringifyObject(obj, indent = 2) {
  // Use JSON.stringify then convert double quotes to single quotes for strings
  const json = JSON.stringify(obj, null, indent);
  // Convert keys to unquoted where possible? Keep JSON style to be safe
  return json.replace(/"([^(")]+)":/g, '$1:').replace(/"/g, "'");
}

const ptLiteral = findObjectLiteral(src, 'pt');
const enLiteral = findObjectLiteral(src, 'en');
const esLiteral = findObjectLiteral(src, 'es');
if (!ptLiteral) { console.error('pt block not found'); process.exit(1); }
if (!enLiteral) { console.error('en block not found'); process.exit(1); }
if (!esLiteral) { console.error('es block not found'); process.exit(1); }

const ptObj = toObject(ptLiteral);
const enObj = toObject(enLiteral);
const esObj = toObject(esLiteral);
if (!ptObj || !enObj || !esObj) { console.error('failed to parse objects'); process.exit(1); }

const newEn = mergeDeep(ptObj, enObj);
const newEs = mergeDeep(ptObj, esObj);

const newEnLiteral = stringifyObject(newEn, 2);
const newEsLiteral = stringifyObject(newEs, 2);

// Replace the old literals in the source
src = src.replace(enLiteral, newEnLiteral);
src = src.replace(esLiteral, newEsLiteral);

fs.writeFileSync(filePath, src, 'utf8');
console.log('translations.ts updated: en and es merged with pt as fallback.');

const fs = require('fs');
const path = require('path');

// Cargar traducciones
const esTranslations = require('../locales/es.json');
const enTranslations = require('../locales/en.json');
const deTranslations = require('../locales/de.json');

// Función para obtener todas las claves de un objeto anidado
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Función para verificar si una clave existe en las traducciones
function keyExists(translations, keyPath) {
  const parts = keyPath.split('.');
  let current = translations;
  for (const part of parts) {
    if (current === undefined || current === null) return false;
    current = current[part];
  }
  return current !== undefined;
}

// Función para extraer claves t() de un archivo
function extractTKeys(content) {
  const keys = new Set();
  
  // Patrones para encontrar llamadas a t()
  const patterns = [
    /t\(['"]([^'"]+)['"]\)/g,           // t('key') o t("key")
    /t\(`([^`]+)`\)/g,                   // t(`key`)
    /\{t\(['"]([^'"]+)['"]\)\}/g,        // {t('key')}
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      // Ignorar claves dinámicas con variables
      if (!key.includes('${') && !key.includes('{')) {
        keys.add(key);
      }
    }
  }
  
  return keys;
}

// Función para escanear archivos recursivamente
function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const allKeys = new Set();
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const keys = extractTKeys(content);
        keys.forEach(key => allKeys.add(key));
      }
    }
  }
  
  scan(dir);
  return allKeys;
}

// Escanear el proyecto
const projectDir = path.join(__dirname, '..');
const usedKeys = scanDirectory(projectDir);

// Obtener todas las claves definidas
const esKeys = new Set(getAllKeys(esTranslations));
const enKeys = new Set(getAllKeys(enTranslations));
const deKeys = new Set(getAllKeys(deTranslations));

// Encontrar claves faltantes
const missingInEs = [];
const missingInEn = [];
const missingInDe = [];

usedKeys.forEach(key => {
  if (!keyExists(esTranslations, key)) {
    missingInEs.push(key);
  }
  if (!keyExists(enTranslations, key)) {
    missingInEn.push(key);
  }
  if (!keyExists(deTranslations, key)) {
    missingInDe.push(key);
  }
});

// Mostrar resultados
console.log('=== ANÁLISIS DE TRADUCCIONES ===\n');
console.log(`Total de claves usadas en el código: ${usedKeys.size}`);
console.log(`Total de claves en es.json: ${esKeys.size}`);
console.log(`Total de claves en en.json: ${enKeys.size}`);
console.log(`Total de claves en de.json: ${deKeys.size}`);

console.log('\n=== CLAVES FALTANTES EN ES.JSON ===');
if (missingInEs.length === 0) {
  console.log('✅ Ninguna clave faltante');
} else {
  missingInEs.sort().forEach(key => console.log(`❌ ${key}`));
}

console.log('\n=== CLAVES FALTANTES EN EN.JSON ===');
if (missingInEn.length === 0) {
  console.log('✅ Ninguna clave faltante');
} else {
  missingInEn.sort().forEach(key => console.log(`❌ ${key}`));
}

console.log('\n=== CLAVES FALTANTES EN DE.JSON ===');
if (missingInDe.length === 0) {
  console.log('✅ Ninguna clave faltante');
} else {
  missingInDe.sort().forEach(key => console.log(`❌ ${key}`));
}

// Exportar resultados a JSON
const results = {
  totalUsedKeys: usedKeys.size,
  usedKeys: Array.from(usedKeys).sort(),
  missingInEs: missingInEs.sort(),
  missingInEn: missingInEn.sort(),
  missingInDe: missingInDe.sort()
};

fs.writeFileSync(
  path.join(__dirname, 'translation-check-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n✅ Resultados guardados en scripts/translation-check-results.json');

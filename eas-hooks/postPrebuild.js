#!/usr/bin/env node

/**
 * EAS Build Hook - Post Prebuild
 * 
 * Este script se ejecuta DESPUÉS de `expo prebuild` pero ANTES de la compilación de Gradle.
 * Aplica correcciones necesarias para resolver el error de timeout al descargar dependencias.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [EAS Hook] Aplicando correcciones de Gradle...');

// Ruta a los archivos de configuración de Gradle
const gradlePropertiesPath = path.join(__dirname, '..', 'android', 'gradle.properties');
const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');

// ========================================
// 1. Modificar gradle.properties
// ========================================
console.log('📝 [1/2] Modificando gradle.properties...');

try {
  let gradleProperties = fs.readFileSync(gradlePropertiesPath, 'utf8');

  // Aumentar memoria JVM
  gradleProperties = gradleProperties.replace(
    /org\.gradle\.jvmargs=-Xmx\d+m/,
    'org.gradle.jvmargs=-Xmx4096m'
  );

  // Agregar configuraciones de timeout si no existen
  if (!gradleProperties.includes('org.gradle.daemon=false')) {
    gradleProperties += '\n# Disable Gradle daemon for EAS builds\norg.gradle.daemon=false\n';
  }

  if (!gradleProperties.includes('systemProp.org.gradle.internal.http.connectionTimeout')) {
    gradleProperties += '\n# Increase timeout for dependency downloads (120 seconds)\n';
    gradleProperties += 'systemProp.org.gradle.internal.http.connectionTimeout=120000\n';
    gradleProperties += 'systemProp.org.gradle.internal.http.socketTimeout=120000\n';
  }

  fs.writeFileSync(gradlePropertiesPath, gradleProperties, 'utf8');
  console.log('✅ gradle.properties actualizado');
} catch (error) {
  console.error('❌ Error al modificar gradle.properties:', error.message);
  process.exit(1);
}

// ========================================
// 2. Modificar build.gradle
// ========================================
console.log('📝 [2/2] Modificando build.gradle...');

try {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

  // Agregar repositorios públicos adicionales en buildscript
  if (!buildGradle.includes('jcenter.bintray.com')) {
    buildGradle = buildGradle.replace(
      /(buildscript\s*\{\s*repositories\s*\{\s*google\(\)\s*mavenCentral\(\))/,
      `$1\n    maven { url 'https://jcenter.bintray.com' }\n    maven { url 'https://repo1.maven.org/maven2' }`
    );
  }

  // Agregar repositorios públicos adicionales en allprojects
  if (!buildGradle.includes("maven { url 'https://jcenter.bintray.com' }")) {
    buildGradle = buildGradle.replace(
      /(allprojects\s*\{\s*repositories\s*\{[^}]*mavenCentral\(\))/,
      `$1\n    maven { url 'https://jcenter.bintray.com' }\n    maven { url 'https://repo1.maven.org/maven2' }`
    );
  }

  fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
  console.log('✅ build.gradle actualizado');
} catch (error) {
  console.error('❌ Error al modificar build.gradle:', error.message);
  process.exit(1);
}

console.log('🎉 [EAS Hook] Correcciones aplicadas exitosamente');
console.log('');

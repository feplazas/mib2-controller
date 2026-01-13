const { withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Plugin de Expo Config para aplicar correcciones de Gradle
 * Este plugin modifica gradle.properties y build.gradle durante el prebuild
 */
const withGradleFix = (config) => {
  // Modificar gradle.properties
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: '-Xmx4096m -XX:MaxMetaspaceSize=512m',
    });
    
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.daemon',
      value: 'false',
    });
    
    config.modResults.push({
      type: 'property',
      key: 'systemProp.org.gradle.internal.http.connectionTimeout',
      value: '120000',
    });
    
    config.modResults.push({
      type: 'property',
      key: 'systemProp.org.gradle.internal.http.socketTimeout',
      value: '120000',
    });
    
    return config;
  });

  // Modificar build.gradle
  config = withProjectBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;

    // Agregar repositorios públicos adicionales en buildscript si no existen
    if (!buildGradle.includes('jcenter.bintray.com')) {
      buildGradle = buildGradle.replace(
        /(buildscript\s*\{\s*repositories\s*\{\s*google\(\)\s*mavenCentral\(\))/,
        `$1\n        maven { url 'https://jcenter.bintray.com' }\n        maven { url 'https://repo1.maven.org/maven2' }`
      );
    }

    // Agregar repositorios públicos adicionales en allprojects si no existen
    if (!buildGradle.includes("maven { url 'https://jcenter.bintray.com' }")) {
      buildGradle = buildGradle.replace(
        /(allprojects\s*\{\s*repositories\s*\{[^}]*mavenCentral\(\))/,
        `$1\n        maven { url 'https://jcenter.bintray.com' }\n        maven { url 'https://repo1.maven.org/maven2' }`
      );
    }

    config.modResults.contents = buildGradle;
    return config;
  });

  return config;
};

module.exports = withGradleFix;

const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin de Expo para agregar permisos y configuración USB Host
 * 
 * MÉTODO ORIGINAL: Usa filtro genérico <usb-device /> para máxima compatibilidad.
 * Este método funciona infaliblemente con todos los adaptadores USB-Ethernet.
 */
const withUsbHost = (config) => {
  // Paso 1: Modificar AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];
    const manifest = androidManifest.manifest;

    // Agregar permisos USB
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const usbPermission = {
      $: {
        'android:name': 'android.permission.USB_PERMISSION',
      },
    };

    // Verificar si el permiso ya existe
    const hasUsbPermission = manifest['uses-permission'].some(
      (permission) => permission.$['android:name'] === 'android.permission.USB_PERMISSION'
    );

    if (!hasUsbPermission) {
      manifest['uses-permission'].push(usbPermission);
    }

    // Agregar característica USB Host (opcional, no requerida)
    if (!manifest['uses-feature']) {
      manifest['uses-feature'] = [];
    }

    const usbHostFeature = {
      $: {
        'android:name': 'android.hardware.usb.host',
        'android:required': 'false',
      },
    };

    const hasUsbHostFeature = manifest['uses-feature'].some(
      (feature) => feature.$['android:name'] === 'android.hardware.usb.host'
    );

    if (!hasUsbHostFeature) {
      manifest['uses-feature'].push(usbHostFeature);
    }

    // Agregar intent filter para USB device attached
    if (!mainApplication.activity) {
      mainApplication.activity = [];
    }

    const mainActivity = mainApplication.activity[0];
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    const usbIntentFilter = {
      action: [
        {
          $: {
            'android:name': 'android.hardware.usb.action.USB_DEVICE_ATTACHED',
          },
        },
      ],
      category: [
        {
          $: {
            'android:name': 'android.intent.category.DEFAULT',
          },
        },
      ],
    };

    const hasUsbIntentFilter = mainActivity['intent-filter'].some((filter) =>
      filter.action?.some(
        (action) =>
          action.$['android:name'] === 'android.hardware.usb.action.USB_DEVICE_ATTACHED'
      )
    );

    if (!hasUsbIntentFilter) {
      mainActivity['intent-filter'].push(usbIntentFilter);
    }

    // Agregar meta-data para device_filter.xml
    if (!mainActivity['meta-data']) {
      mainActivity['meta-data'] = [];
    }

    const deviceFilterMetaData = {
      $: {
        'android:name': 'android.hardware.usb.action.USB_DEVICE_ATTACHED',
        'android:resource': '@xml/device_filter',
      },
    };

    const hasDeviceFilterMetaData = mainActivity['meta-data'].some(
      (meta) =>
        meta.$['android:name'] === 'android.hardware.usb.action.USB_DEVICE_ATTACHED'
    );

    if (!hasDeviceFilterMetaData) {
      mainActivity['meta-data'].push(deviceFilterMetaData);
    }

    return config;
  });

  // Paso 2: Crear archivo device_filter.xml en res/xml/
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidResPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      const xmlPath = path.join(androidResPath, 'xml');
      const deviceFilterPath = path.join(xmlPath, 'device_filter.xml');

      // Crear directorio xml si no existe
      if (!fs.existsSync(xmlPath)) {
        fs.mkdirSync(xmlPath, { recursive: true });
      }

      // MÉTODO ORIGINAL: Filtro genérico que acepta CUALQUIER dispositivo USB
      // Este es el método que funciona infaliblemente con todos los adaptadores
      const deviceFilterContent = `<?xml version="1.0" encoding="utf-8"?>
<!--
  MIB2 Controller - USB Device Filter
  
  GENERIC FILTER: Accepts ANY USB device for maximum compatibility.
  
  This app is designed to work with USB-Ethernet adapters for MIB2 infotainment
  system configuration. The generic filter ensures all compatible adapters
  are detected regardless of their specific VID/PID.
  
  LEGAL BASIS: This app operates under the Right to Repair doctrine.
  See PRIVACY.md for full legal analysis.
-->
<resources>
    <!-- Generic USB device filter - accepts ANY USB device -->
    <usb-device />
</resources>
`;

      // Escribir archivo
      fs.writeFileSync(deviceFilterPath, deviceFilterContent, 'utf-8');
      console.log('✅ Created device_filter.xml with GENERIC filter at:', deviceFilterPath);

      return config;
    },
  ]);

  return config;
};

module.exports = withUsbHost;

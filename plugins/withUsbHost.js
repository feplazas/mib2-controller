const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin de Expo para agregar permisos y configuración USB Host
 * 
 * NOTA DE SEGURIDAD: Este plugin configura filtros USB específicos para
 * adaptadores USB-Ethernet compatibles con MIB2 STD2 Technisat Preh.
 * Solo se declaran los dispositivos necesarios para la funcionalidad de la app.
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

      // Contenido del device_filter.xml - FILTROS ESPECÍFICOS PARA ADAPTADORES MIB2
      // IMPORTANTE: Android requiere valores en DECIMAL, no hexadecimal
      // 
      // Conversiones:
      // ASIX: 0x0B95 = 2965 (decimal)
      // Realtek: 0x0BDA = 3034 (decimal)
      // 
      // Product IDs ASIX:
      // 0x7720 = 30496, 0x772A = 30506, 0x772B = 30507
      // 0x1780 = 6016, 0x1790 = 6032
      //
      // Product IDs Realtek:
      // 0x8152 = 33106, 0x8153 = 33107
      const deviceFilterContent = `<?xml version="1.0" encoding="utf-8"?>
<!--
  MIB2 Controller - USB Device Filter
  
  This filter declares USB-Ethernet adapters compatible with MIB2 STD2 Technisat Preh.
  
  IMPORTANT: Android requires DECIMAL values, not hexadecimal!
  
  LEGAL BASIS: This app operates under the Right to Repair doctrine.
  See PRIVACY.md for full legal analysis.
-->
<resources>
    <!-- ASIX AX88772/AX88772A/AX88772B - Primary MIB2 compatible chipset -->
    <!-- vendor-id: 0x0B95 = 2965, product-id: 0x7720 = 30496 -->
    <usb-device vendor-id="2965" product-id="30496" />
    <!-- vendor-id: 0x0B95 = 2965, product-id: 0x772A = 30506 -->
    <usb-device vendor-id="2965" product-id="30506" />
    <!-- vendor-id: 0x0B95 = 2965, product-id: 0x772B = 30507 (TARGET FOR SPOOFED ADAPTERS) -->
    <usb-device vendor-id="2965" product-id="30507" />
    
    <!-- ASIX AX88178 - High-speed USB 2.0 variant -->
    <!-- vendor-id: 0x0B95 = 2965, product-id: 0x1780 = 6016 -->
    <usb-device vendor-id="2965" product-id="6016" />
    
    <!-- ASIX AX88179 - USB 3.0 Gigabit variant -->
    <!-- vendor-id: 0x0B95 = 2965, product-id: 0x1790 = 6032 -->
    <usb-device vendor-id="2965" product-id="6032" />
    
    <!-- Realtek RTL8152 - USB 2.0 Fast Ethernet -->
    <!-- vendor-id: 0x0BDA = 3034, product-id: 0x8152 = 33106 -->
    <usb-device vendor-id="3034" product-id="33106" />
    
    <!-- Realtek RTL8153 - USB 3.0 Gigabit Ethernet -->
    <!-- vendor-id: 0x0BDA = 3034, product-id: 0x8153 = 33107 -->
    <usb-device vendor-id="3034" product-id="33107" />
    
    <!-- Generic ASIX-based adapters (common rebrands) -->
    <!-- D-Link DUB-E100: vendor-id: 0x2001 = 8193, product-id: 0x1A00 = 6656 -->
    <usb-device vendor-id="8193" product-id="6656" />
    <!-- Linksys USB200M: vendor-id: 0x13B1 = 5041, product-id: 0x0018 = 24 -->
    <usb-device vendor-id="5041" product-id="24" />
    <!-- Apple USB Ethernet Adapter: vendor-id: 0x05AC = 1452, product-id: 0x1402 = 5122 -->
    <usb-device vendor-id="1452" product-id="5122" />
    
    <!-- Additional known MIB2-compatible adapters -->
    <!-- Belkin F5D5055: vendor-id: 0x050D = 1293, product-id: 0x5055 = 20565 -->
    <usb-device vendor-id="1293" product-id="20565" />
    <!-- Netgear FA120: vendor-id: 0x0846 = 2118, product-id: 0x1040 = 4160 -->
    <usb-device vendor-id="2118" product-id="4160" />
    
    <!-- Fallback: Accept any ASIX device (vendor-id only) -->
    <usb-device vendor-id="2965" />
    
    <!-- Fallback: Accept any Realtek USB Ethernet device (vendor-id only) -->
    <usb-device vendor-id="3034" />
</resources>
`;

      // Escribir archivo
      fs.writeFileSync(deviceFilterPath, deviceFilterContent, 'utf-8');
      console.log('✅ Created device_filter.xml with DECIMAL values at:', deviceFilterPath);

      return config;
    },
  ]);

  return config;
};

module.exports = withUsbHost;

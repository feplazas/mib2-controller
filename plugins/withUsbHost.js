const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Plugin de Expo para agregar permisos y configuración USB Host
 */
const withUsbHost = (config) => {
  return withAndroidManifest(config, async (config) => {
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

    // Agregar característica USB Host
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
};

module.exports = withUsbHost;

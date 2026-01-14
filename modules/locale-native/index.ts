import { NativeModules } from 'react-native';

const { LocaleModule } = NativeModules;

if (!LocaleModule) {
  throw new Error('LocaleModule native module is not available');
}

export interface LocaleModuleInterface {
  getSystemLanguage(): Promise<string>;
  getSystemLocale(): Promise<string>;
}

export default LocaleModule as LocaleModuleInterface;

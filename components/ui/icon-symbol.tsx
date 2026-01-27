// SF Symbols to Material Icons mapping for cross-platform consistency
// Uses native SF Symbols on iOS, Material Icons on Android and web

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons Mapping
 * 
 * Ultra Premium Apple-like icon set for MIB2 Controller
 * 
 * Reference:
 * - SF Symbols: https://developer.apple.com/sf-symbols/
 * - Material Icons: https://icons.expo.fyi/
 */
const MAPPING = {
  // Navigation & Tab Bar
  "house.fill": "home",
  "gear": "settings",
  "wrench.fill": "build",
  "cable.connector": "usb",
  "waveform.path.ecg": "monitor-heart",
  
  // Diagnostics & Tools
  "stethoscope": "healing",
  "hammer.fill": "construction",
  "arrow.counterclockwise": "restore",
  "qrcode": "qr-code-2",
  "externaldrive.fill": "storage",
  "folder.fill": "folder",
  "doc.fill": "description",
  "terminal.fill": "terminal",
  
  // Status & Indicators
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "exclamationmark.triangle.fill": "warning",
  "info.circle": "info-outline",
  "info.circle.fill": "info",
  "bolt.fill": "flash-on",
  "bolt.slash.fill": "flash-off",
  
  // Actions
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "arrow.clockwise": "refresh",
  "arrow.right.circle.fill": "arrow-circle-right",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
  "trash.fill": "delete",
  "pencil": "edit",
  "square.and.arrow.up": "share",
  "doc.on.doc": "content-copy",
  
  // Communication
  "paperplane.fill": "send",
  "antenna.radiowaves.left.and.right": "wifi-tethering",
  "wifi": "wifi",
  "wifi.slash": "wifi-off",
  "network": "lan",
  "network.badge.shield.half.filled": "security",
  "point.3.connected.trianglepath.dotted": "hub",
  
  // Security & Keys
  "key.fill": "vpn-key",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  "shield.fill": "security",
  "shield.checkmark.fill": "verified-user",
  
  // Data & Charts
  "chart.bar.fill": "bar-chart",
  "chart.pie.fill": "pie-chart",
  "list.bullet": "list",
  "list.number": "format-list-numbered",
  "archivebox.fill": "inventory",
  "tray.fill": "inbox",
  
  // Devices & Hardware
  "car.fill": "directions-car",
  "cpu.fill": "memory",
  "memorychip.fill": "memory",
  "sdcard.fill": "sd-card",
  "display": "desktop-windows",
  
  // People & Users
  "person.fill": "person",
  "person.2.fill": "people",
  "person.circle.fill": "account-circle",
  
  // Documentation
  "book.fill": "menu-book",
  "book.closed.fill": "book",
  
  // Misc
  "bandage.fill": "healing",
  "sparkles": "auto-awesome",
  "star.fill": "star",
  "heart.fill": "favorite",
  "flag.fill": "flag",
  "tag.fill": "local-offer",
  "clock.fill": "schedule",
  "calendar": "calendar-today",
  "globe": "language",
  "magnifyingglass": "search",
  "slider.horizontal.3": "tune",
  "ellipsis.circle": "more-horiz",
  "questionmark.circle": "help-outline",
  
  // Code & Development
  "chevron.left.forwardslash.chevron.right": "code",
  "curlybraces": "data-object",
  "number": "tag",
} as const satisfies Record<string, MaterialIconName>;

/**
 * IconSymbol Component
 * 
 * Cross-platform icon component that uses native SF Symbols on iOS
 * and Material Icons on Android and web for consistent premium look.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name];
  
  // Fallback to a default icon if mapping not found
  if (!iconName) {
    console.warn(`IconSymbol: No mapping found for "${String(name)}", using default`);
    return <MaterialIcons color={color} size={size} name="help-outline" style={style} />;
  }
  
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}

module.exports = function (api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === 'production';
  let plugins = [];

  plugins.push("react-native-worklets/plugin");

  // Remove console.log in production builds
  if (isProduction) {
    plugins.push("./scripts/remove-console-logs.js");
  }

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins,
  };
};

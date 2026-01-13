// Validate JWT_SECRET in production
const validateJwtSecret = () => {
  const secret = process.env.JWT_SECRET ?? "";
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "SECURITY ERROR: JWT_SECRET must be at least 32 characters in production. " +
      "Set JWT_SECRET environment variable with a strong random string."
    );
  }
  return secret;
};

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: validateJwtSecret(),
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

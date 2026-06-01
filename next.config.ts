/** @type {import('next').NextConfig} */
const nextConfig = {
  // serverRuntimeConfig solo está disponible en el código del lado del servidor.
  // Es la forma segura de manejar secretos.
  serverRuntimeConfig: {
    PORTAL_REGION: process.env.PORTAL_REGION,
    PORTAL_TABLE_NAME: process.env.PORTAL_TABLE_NAME,
    PORTAL_ACCESS_KEY_ID: process.env.PORTAL_ACCESS_KEY_ID,
    PORTAL_SECRET_ACCESS_KEY: process.env.PORTAL_SECRET_ACCESS_KEY,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
  // publicRuntimeConfig está disponible tanto en el servidor como en el navegador.
  // NO lo usamos para secretos.
  publicRuntimeConfig: {},
};

export default nextConfig;

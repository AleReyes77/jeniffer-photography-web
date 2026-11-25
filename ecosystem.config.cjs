/**
 * Configuración de PM2: mantiene el servidor encendido en un VPS.
 * Si el proceso se cae, PM2 lo vuelve a iniciar; también lo arranca al reiniciar el servidor.
 *
 *   npm install -g pm2
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'jeniffer-photography',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1', // solo accesible a través de Nginx/Caddy, nunca directo desde internet
        TRUST_PROXY: 'true',
      },
    },
  ],
};

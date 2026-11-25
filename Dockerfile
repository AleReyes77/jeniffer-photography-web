# ---- Imagen de producción del sitio de Jeniffer Valle Fotografía ----
FROM node:22-alpine

ENV NODE_ENV=production
# Dentro del contenedor hay que escuchar en todas las interfaces; Docker decide qué se publica.
ENV HOST=0.0.0.0
WORKDIR /app

# Instala solo las dependencias de producción (capa en caché si package*.json no cambia)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia el código y el sitio
COPY server ./server
COPY public ./public

# Carpeta de datos con permisos para el usuario sin privilegios "node"
RUN mkdir -p data && chown -R node:node data
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/salud || exit 1

CMD ["node", "server/index.js"]

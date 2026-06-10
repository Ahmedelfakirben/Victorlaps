# Etapa 1: Compilación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# Etapa 2: Servidor Web (Nginx) y Worker de Correo (NodeJS)
FROM nginx:alpine

# Instalar NodeJS y NPM en Alpine
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados estáticos de React a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar el código del servicio de correos y package.json
COPY services/mailer /app/services/mailer
COPY package.json package-lock.json* /app/

# Instalar dependencias necesarias para el mailer en modo producción
RUN npm install --only=production

# Crear script de inicio para ejecutar Nginx y el Mailer en paralelo
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'nginx -g "daemon on;"' >> /app/entrypoint.sh && \
    echo 'echo "Starting Mailer Service..."' >> /app/entrypoint.sh && \
    echo 'node /app/services/mailer/index.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

EXPOSE 80

CMD ["/app/entrypoint.sh"]

# Etapa 1: Compilación
FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copiamos la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos compilados estáticos de React a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

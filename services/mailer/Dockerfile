FROM node:18-alpine

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package.json ./
RUN npm install --omit=dev

# Copiamos el código
COPY index.js ./

# Arrancamos el servicio
CMD ["npm", "start"]

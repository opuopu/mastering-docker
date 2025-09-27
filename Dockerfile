FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p logs
EXPOSE 3000
CMD ["node", "index.js"]
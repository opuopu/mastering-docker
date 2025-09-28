FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p logs
# implement docker volume here
# VOLUME [ "/usr/src/app/logs" ]

EXPOSE 3000
CMD ["node", "index.js"]
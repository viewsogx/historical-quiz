FROM node

WORKDIR /app

COPY . .

RUN npm i

CMD ["node", "server.js"]

# docker build ./backend -t backend
# docker run -d -p 8001:3000 backend

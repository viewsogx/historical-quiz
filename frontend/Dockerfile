FROM node as build

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build

FROM nginx as final

COPY --from=build /app/dist /usr/share/nginx/html

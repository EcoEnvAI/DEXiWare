FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build -- --configuration production --base-href /true/ --deploy-url /true/ \
  && mkdir -p /tmp/www \
  && if [ -d dist/true/browser ]; then cp -a dist/true/browser/. /tmp/www/; else cp -a dist/true/. /tmp/www/; fi

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/www /usr/share/nginx/html/true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

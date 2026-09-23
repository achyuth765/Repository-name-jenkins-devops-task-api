FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


FROM node:22-alpine

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY src ./src

# npm is not required to run the production application.
# Remove npm and its bundled vulnerable dependencies
# from the final runtime image.
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

EXPOSE 3000

CMD ["node", "src/app.js"]

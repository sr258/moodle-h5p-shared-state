FROM node:16 AS BUILD_IMAGE

RUN npm install -g clean-modules

WORKDIR /app

COPY . /app/

# install 
RUN npm ci

# build
RUN npm run build

# remove development dependencies
RUN npm prune --production

# run clean-modules
RUN clean-modules --exclude "**/@lumieducation/**" --yes

FROM node:16-alpine

WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /app/build ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

EXPOSE 80

CMD [ "node", "dist/index.js" ]
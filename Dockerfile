FROM node:lts-slim as base

FROM base as release
USER node
WORKDIR /home/node
COPY src/jscpd-formatter-rdjson /home/node/jscpd-formatter-rdjson
ENTRYPOINT ["node", "/home/node/jscpd-formatter-rdjson/index.js"]

FROM base as bats
RUN set -x \
  && apt-get update -qq \
  && apt-get install -qq -y --no-install-recommends \
     bats \
     gron \
  && apt-get purge -qq -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && npm install -g jscpd
ENTRYPOINT ["/usr/bin/bats"]

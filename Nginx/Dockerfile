FROM nginx:1.27.5-alpine-slim@sha256:b947b2630c97622793113555e13332eec85bdc7a0ac6ab697159af78942bb856

RUN apk update && \
    apk upgrade && \
    apk add vim openssl curl

COPY shmooz.conf /etc/nginx/conf.d/default.conf
COPY robots.txt /usr/share/nginx/html/robots.txt
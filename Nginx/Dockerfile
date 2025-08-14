FROM nginx:1.27.5-alpine-slim@sha256:b947b2630c97622793113555e13332eec85bdc7a0ac6ab697159af78942bb856

RUN apk update && \
    apk upgrade && \
    apk add vim openssl    

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -out /etc/nginx/ssl/shmooz.pem -keyout /etc/nginx/ssl/shmooz.key \
    -subj "/C=FR/ST=Alpes-Maritimes/L=Nice/O=Ecole\ 42/OU=Ecole/CN=shmooz.fr/emailAddress=lkukahle@student.42nice.fr"

COPY shmooz.conf /etc/nginx/conf.d/default.conf
COPY robots.txt /usr/share/nginx/html/robots.txt
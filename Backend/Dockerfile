FROM python:3.13-alpine-slim@sha256:18159b2be11db91f84b8f8f655cd860f805dbd9e49a583ddaac8ab39bf4fe1a7

WORKDIR /app

RUN apk update && \
    apk add --no-cache netcat-openbsd && \
    rm -rf /var/cache/apk/*

#COPY . .

RUN chmod +X entrypoint.sh

RUN pip install --no-cache-dir -r requirements.txt

CMD [ "/app/entrypoint.sh" ]
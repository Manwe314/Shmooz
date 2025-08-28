FROM python:3.13-alpine-slim@sha256:18159b2be11db91f84b8f8f655cd860f805dbd9e49a583ddaac8ab39bf4fe1a7 AS builder

WORKDIR /app

RUN apk update && \
    apk add --no-cache \
        gcc \
        musl-dev \
        postgresql-dev \
        python3-dev \
        libffi-dev \
        openssl-dev && \
    rm -rf /var/cache/apk/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.13-alpine-slim@sha256:18159b2be11db91f84b8f8f655cd860f805dbd9e49a583ddaac8ab39bf4fe1a7

WORKDIR /app

RUN apk update && \
    apk add --no-cache \
        postgresql-client \
        netcat-openbsd \
        su-exec && \
    rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=builder /root/.local /home/appuser/.local
RUN chown -R appuser:appgroup /home/appuser/.local

ENV PATH=/home/appuser/.local/bin:$PATH

RUN mkdir -p /app/logs /app/staticfiles /app/media /app/media/uploads && \
    chown -R appuser:appgroup /app

COPY --chown=appuser:appgroup . .

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

HEALTHCHECK --interval=45s --timeout=10s --start-period=5s --retries=3 \
    CMD nc -z localhost 8000 || exit 1

EXPOSE 8000

CMD ["/app/entrypoint.sh"]

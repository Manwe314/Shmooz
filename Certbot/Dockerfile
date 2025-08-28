FROM certbot/certbot:v2.7.4

COPY entrypoint.sh /usr/local/bin/certbot-run.sh
RUN chmod +x /usr/local/bin/certbot-run.sh

ENTRYPOINT ["/usr/local/bin/certbot-run.sh"]

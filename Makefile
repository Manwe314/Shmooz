all:	up

up:
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	@mkdir -p ./Volume/media/uploads
	@mkdir -p ./Volume/logs
	@mkdir -p ./Volume/staticfiles
	@mkdir -p ./Volume/certbot/conf
	@mkdir -p ./Volume/certbot/www
	@mkdir -p ./Volume/certbot/logs
	docker compose -f docker-compose.yml up

detach:
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	@mkdir -p ./Volume/media/uploads
	@mkdir -p ./Volume/logs
	@mkdir -p ./Volume/staticfiles
	docker compose  -f docker-compose.yml up -d

down:
	docker compose -f docker-compose.yml down

fclean: down
	@docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker system prune -a --force
	rm -Rf ./Volume
	rm -Rf ./Backend/administration/__pycache__
	rm -Rf ./Backend/portfolio/__pycache__
re:
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	@mkdir -p ./Volume/media/uploads
	@mkdir -p ./Volume/logs
	@mkdir -p ./Volume/staticfiles
	@docker compose -f docker-compose.yml build
	@docker compose -f docker-compose.yml up

dre:
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	@mkdir -p ./Volume/media/uploads
	@mkdir -p ./Volume/logs
	@mkdir -p ./Volume/staticfiles
	@docker compose -f docker-compose.yml build
	@docker compose -f -d docker-compose.yml up

ssl-setup:
	@chmod +x ssl-setup.sh ssl-renew.sh ssl-cron-setup.sh ssl-setup-standalone.sh
	@./ssl-setup.sh

ssl-setup-standalone:
	@chmod +x ssl-setup-standalone.sh ssl-renew.sh ssl-cron-setup.sh
	@./ssl-setup-standalone.sh

ssl-renew:
	@./ssl-renew.sh

ssl-cron:
	@./ssl-cron-setup.sh

logs:
	docker compose -f docker-compose.yml logs -f

.PHONY: all up down fclean re detach dre ssl-setup ssl-renew ssl-cron logs

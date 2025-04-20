all:	up

up:
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	docker compose -f docker-compose.yml up

detach:
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	docker compose -f -d docker-compose.yml up

down:
	docker compose -f docker-compose.yml down

fclean: down
	@docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker system prune -a --force
	rm -Rf ./Volume

re: 
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	@docker compose -f docker-compose.yml build
	@docker compose -f docker-compose.yml up

dre: 
	@mkdir -p ./Volume
	@mkdir -p ./Volume/postgresql
	@docker compose -f docker-compose.yml build
	@docker compose -f -d docker-compose.yml up

.PHONY: all up down fclean re detach dre
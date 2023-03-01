# denso_doc_tagging

  

1. Config parameter value

- `docker-compose.yml`
	- Configure database information
		- DB_USER => username of database, delete this if no credential
		- DB_PASS => password of database, delete this if no credential
		- DB_HOST => ip address of database
		- DB_PORT => port of database
		- DB_NAME => name of database
	- `nextjs/.env.example`
		- Change ip address of https://128.199.243.160/api/ to your ip address or hostname
		- Copy .env.example to .env

2. Build docker image
```docker-compose build```
3. Run docker
```docker-compose up -d```
If you need to see the log, can be done by
```docker-compose logs -f```
# Docker Compose Commands

Comandos para rodar backend, frontend e LocalStack (SQS) com Docker Compose.

## Build das imagens

```bash
docker compose build
```

## Subir todos os servicos

```bash
docker compose up -d
```

## Ver containers em execucao

```bash
docker compose ps
```

## Ver logs da API HTTP

```bash
docker compose logs -f backend-api
```

## Ver logs do worker (importacao SQS)

```bash
docker compose logs -f backend-worker
```

## Ver logs do LocalStack (SQS)

```bash
docker compose logs -f localstack
```

## Smoke test (exemplo)

```bash
curl http://localhost:3000/api/v1
```

## Parar e remover containers/rede

```bash
docker compose down
```

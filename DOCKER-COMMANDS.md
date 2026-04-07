# Docker Compose Commands

Comandos para rodar o backend com Docker Compose.

## Build da imagem

```bash
docker compose build backend
```

## Subir o backend

```bash
docker compose up -d backend
```

## Ver containers em execucao

```bash
docker compose ps
```

## Ver logs do backend

```bash
docker compose logs -f backend
```

## Smoke test (exemplo)

```bash
curl http://localhost:3000/api/v1
```

## Parar e remover containers/rede

```bash
docker compose down
```

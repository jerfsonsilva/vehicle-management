# Docker Compose Commands

Comandos para rodar backend, frontend, worker, LocalStack (SQS), Prometheus e Grafana com Docker Compose.

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
docker compose logs -f backend
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

## Verificar endpoint de metricas da API

```bash
curl http://localhost:3000/metrics
```

## Verificar endpoint de metricas do worker

```bash
curl http://localhost:9100/metrics
```

## URLs locais

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api/v1`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (login padrao: `admin` / `admin`)

## Troubleshooting rapido

- Target `DOWN` no Prometheus: confira se `backend` e `backend-worker` estao de pe (`docker compose ps`).
- Dashboard sem dados: valide no Prometheus se ha series com `vehicle_` via query `vehicle_http_requests_total`.
- `/metrics` indisponivel: confira variaveis de ambiente no compose e logs dos servicos.

## Parar e remover containers/rede

```bash
docker compose down
```

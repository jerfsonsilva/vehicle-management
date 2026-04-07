# Vehicle API Architecture Guide

Este documento define o padrao arquitetural oficial do projeto. Toda evolucao deve seguir estas regras para manter consistencia, testabilidade e baixo acoplamento.

## Objetivo da arquitetura

- Separar responsabilidade por camada.
- Evitar regra de negocio em controller e em repositório de infraestrutura.
- Garantir que mudancas de framework/ORM tenham impacto minimo no dominio.
- Facilitar manutencao, testes e escalabilidade.

## Stack e convencoes

- Framework: NestJS
- ORM: Prisma
- Linguagem: TypeScript
- API base: `/api/v1`
- Dominio principal atual: `vehicle`

## Estrutura oficial do modulo `vehicle`

```text
src/modules/vehicle
├── domain
│   ├── entities
│   │   └── vehicle.entity.ts
│   └── repositories
│       └── vehicle.repository.ts
├── application
│   ├── commands
│   │   └── create-vehicle.command.ts
│   ├── queries
│   │   └── get-vehicle.query.ts
│   └── use-cases
│       ├── create-vehicle.usecase.ts
│       ├── get-vehicle.usecase.ts
│       ├── update-vehicle.usecase.ts
│       └── delete-vehicle.usecase.ts
├── infra
│   ├── database
│   │   └── prisma-vehicle.repository.ts
│   ├── factories
│   │   └── vehicle-entity.factory.ts
│   └── utils
│       └── prisma-error.util.ts
├── presentation
│   ├── dto
│   │   ├── create-vehicle.dto.ts
│   │   └── update-vehicle.dto.ts
│   └── vehicle.controller.ts
└── vehicle.module.ts
```

## Fluxo de requisicao

1. `Controller` recebe request e valida payload (DTO).
2. `UseCase` orquestra a regra de aplicacao.
3. `UseCase` depende de `VehicleRepository` (contrato do dominio).
4. `PrismaVehicleRepository` implementa o contrato.
5. `Factory` converte dados de persistencia em `VehicleEntity`.
6. `Utils` trata erros tecnicos do Prisma com mapeamento consistente.

## Descricao de cada modulo/camada

### 1) Presentation

Responsavel por entrada/saida HTTP.

- `vehicle.controller.ts`
  - Define rotas REST.
  - Nao contem regra de negocio.
  - Apenas converte DTO -> comando/query e chama use case.
- `dto/*.ts`
  - Validacao de payload com `class-validator`.
  - Contrato de entrada da API.

### 2) Application

Responsavel por casos de uso e regras de orquestracao.

- `use-cases/*.usecase.ts`
  - Um arquivo por acao de negocio (create/get/update/delete).
  - Pode lançar excecoes de negocio esperadas (ex.: `NotFoundException`).
  - Erro inesperado deve retornar `InternalServerErrorException`.
- `commands/*.command.ts`
  - Objetos de entrada para operacoes de escrita.
- `queries/*.query.ts`
  - Objetos de entrada para operacoes de leitura.

### 3) Domain

Responsavel pelo nucleo do negocio.

- `entities/vehicle.entity.ts`
  - Modelo de dominio puro.
  - Sem dependencia de framework.
- `repositories/vehicle.repository.ts`
  - Contrato abstrato de persistencia.
  - Application depende deste contrato, nunca de Prisma direto.

### 4) Infra

Responsavel por detalhes tecnicos de persistencia e integracoes.

- `database/prisma-vehicle.repository.ts`
  - Implementacao concreta de `VehicleRepository`.
  - Acesso ao banco via Prisma.
- `factories/vehicle-entity.factory.ts`
  - Mapeamento de dados de infraestrutura para entidade de dominio.
- `utils/prisma-error.util.ts`
  - Mapeamento padronizado de erros Prisma (P2002, P2025, etc).

## VehicleModule (composition root do dominio)

`vehicle.module.ts` deve:

- Registrar `VehicleController`.
- Registrar todos os `UseCases`.
- Vincular `VehicleRepository` ao `PrismaVehicleRepository`.
- Nao conter regra de negocio.

## Regras obrigatorias para contribuicao

1. Nao colocar regra de negocio em controller.
2. Nao acessar Prisma direto em use case.
3. Todo use case deve depender de contrato do dominio.
4. Erros de infraestrutura devem ser mapeados de forma consistente.
5. Mapeamentos de entidade devem ficar em factory/utilitario dedicado.
6. Novo modulo deve seguir a mesma estrutura por camadas.
7. Qualquer alteracao deve manter `build`, `test` e `lint` passando.

## Padrao de testes unitarios por camada

As camadas de teste devem seguir este desenho, sem excecao:

1. Os testes ficam dentro de cada modulo.
2. Existe teste separado para cada use case.
3. Existem testes para os repositories.
4. Existem testes para os controllers.
5. O desenho de referencia e este:

```text
src
 └── modules
     └── vehicle
         ├── domain
         │   ├── entities
         │   │   ├── vehicle.entity.ts
         │   │   └── vehicle.entity.spec.ts
         │   │
         │   └── repositories
         │       └── vehicle.repository.ts
         │
         ├── application
         │   └── use-cases
         │       ├── create-vehicle.usecase.ts
         │       └── create-vehicle.usecase.spec.ts
         │
         ├── infra
         │   └── database
         │       ├── prisma-vehicle.repository.ts
         │       └── prisma-vehicle.repository.spec.ts
         │
         ├── presentation
         │   └── vehicle.controller.ts
         │            vehicle.controller.spec.ts
         └── vehicle.module.ts
```

### Regra de nome para testes

- Entidades: `*.entity.spec.ts`
- Use cases: `*.usecase.spec.ts`
- Repository de infraestrutura: `*.repository.spec.ts`
- Controllers: `*.controller.spec.ts`

### Diretriz de cobertura minima por modulo

- Cada use case deve ter pelo menos 1 teste de sucesso e 1 teste de erro.
- Cada repository deve ter testes para mapeamento e tratamento de erro.
- Cada controller deve testar contrato de entrada e delegacao para use case.

## Modelo de dados atual (Vehicle)

Campos de referencia no Prisma:

- `id`
- `licensePlate`
- `chassis`
- `registrationNumber`
- `model`
- `brand`
- `year`
- `createdAt`
- `updatedAt`

Observacao: `createdAt` e `updatedAt` sao gerenciados automaticamente pelo Prisma e nao fazem parte da entidade de dominio atual.

## Evolucao recomendada

- Adicionar testes unitarios por use case.
- Adicionar testes para `PrismaVehicleRepository` (mock PrismaService).
- Criar modulo compartilhado de contracts/factories se novos dominios surgirem.

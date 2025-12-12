# Route Optimizer App

Monorepo para um app de otimização de rotas com backend em Node.js/TypeScript e frontend em React/TypeScript.

## Estrutura
- `backend/`: API Express + Prisma (Node.js + TypeScript)
- `frontend/`: SPA React com Vite, Tailwind e React Query

## Como rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Backend
```bash
cd route-optimizer-app/backend
npm install
npm run dev
```

Configure um arquivo `.env` na pasta `backend/` (baseado em `.env.example`) para definir porta, conexão com o banco e chaves usadas pela API.

### Frontend
```bash
cd route-optimizer-app/frontend
npm install
npm run dev
```

### Build
- Backend: `npm run build` (gera `dist/`)
- Frontend: `npm run build` (gera `dist/`)

### Preview Frontend
```bash
cd route-optimizer-app/frontend
npm run preview
```

### Deploy no Railway / Buildpacks
Execute o `start.sh` localizado na raiz deste monorepo (ou na raiz do app no Railway) para instalar dependências do backend, compilar TypeScript e subir o servidor compilado:
```bash
./start.sh
```

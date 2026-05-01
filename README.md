# Scout FTV — Frontend

Interface web para análise de ataques no Futevôlei.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** strict
- **Tailwind CSS**
- **Zustand** — gerenciamento de estado
- **Axios** — cliente HTTP com interceptors
- **React Hook Form + Zod** — formulários e validação
- **Recharts** — gráficos no dashboard
- **Docker** — deploy containerizado
- **Vercel** — deploy em produção

---

## Estrutura

```
src/
├── app/                        # Rotas (App Router)
│   ├── auth/login/             # Tela de login
│   └── dashboard/              # Painel admin
│
├── components/
│   ├── layout/                 # Navbar
│   ├── partidas/               # Cards, Modal, Timer, Histórico
│   ├── placar/                 # Placar interativo
│   ├── quadra/                 # Canvas livre + ZoneGrid
│   └── dashboard/              # StatsCards, Gráficos, Mapa
│
├── services/                   # Chamadas à API (1 arquivo por recurso)
│
├── store/                      # Zustand stores
│
├── hooks/                      # Custom hooks
│
├── lib/
│   ├── api/                    # Axios client + endpoints
│   ├── utils/                  # Helpers (cn, formatTimer, etc.)
│   └── validations/            # Schemas Zod
│
└── types/.                     # Todos os tipos TypeScript
```

---

## Configuração local

```bash
# 1. Clone e instale
npm install

# 2. Configure variáveis
cp .env.example .env.local
# Edite NEXT_PUBLIC_API_URL com a URL do seu backend

# 3. Rode
npm run dev
```

---

## Docker (local completo)

```bash
# Sobe frontend + backend
docker-compose up --build

# Só o frontend
docker build -t scout-ftv .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://seu-backend/api/v1 scout-ftv
```

---

## Deploy Vercel

```bash
# 1. Instale a CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configure a variável de ambiente no painel Vercel:
#    NEXT_PUBLIC_API_URL = https://seu-backend.railway.app/api/v1
```

O arquivo `vercel.json` já está configurado com a região `gru1` (São Paulo).

---

## Padrão de API

Todos os serviços esperam respostas no formato:

```json
{
  "success": true,
  "data": { ... },
  "message": "opcional"
}
```

Erros:
```json
{
  "success": false,
  "message": "Mensagem de erro",
  "statusCode": 400,
  "errors": { "campo": ["erro"] }
}
```

O token JWT é enviado automaticamente via `Authorization: Bearer <token>` pelo interceptor do Axios. Refresh automático em caso de 401.

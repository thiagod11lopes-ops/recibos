# Recibos

Sistema web para geração de recibos de pagamento de imóveis, com controle de parcelas, status de pagamento e exportação em PDF, Word e HTML.

![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6)
![License](https://img.shields.io/badge/license-MIT-blue)

## Funcionalidades

### Novo Recibo
- Formulário de vendedor, comprador e imóvel
- Tabela de parcelas editável (inicia vazia a cada recarga)
- Botão **Adicionar** — inclui a próxima parcela pendente com a data atual
- Botão **Gerar recibo** — marca a parcela como paga, atualiza o status e exibe a pré-visualização
- Pré-visualização em tempo real com assinatura e data de geração
- Exportação individual ou em lote para **PDF**

### Todos os Recibos
- Arquivo com 19 recibos mensais (Jan/2025 a Jul/2026)
- Exportação em **PDF**, **Word (.doc)** e **HTML (LibreOffice)**
- Impressão direta pelo navegador

### Status de Pagamento
- 72 parcelas com checkbox de pagamento
- Colunas: parcela, referência, vencimento, **data de pagamento**, valor e status
- Resumo de parcelas pagas e pendentes com barra de progresso
- **Gerar Tabela de Pagamento** — exporta PDF, Word ou HTML com filtro de parcelas

## Requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- npm 10+

## Instalação

```bash
git clone https://github.com/thiagod11lopes-ops/recibos.git
cd recibos
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## Acesso online

O sistema está publicado no GitHub Pages:

**https://thiagod11lopes-ops.github.io/recibos/**

A cada push na branch `main`, o deploy é atualizado automaticamente.

## Build

```bash
npm run build
npm run preview
```

## Scripts

| Comando         | Descrição                          |
|-----------------|------------------------------------|
| `npm run dev`   | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção                  |
| `npm run preview` | Pré-visualiza o build            |

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Supabase (PostgreSQL + Realtime)
- jsPDF + jspdf-autotable
- Lucide React

## Supabase

O sistema persiste contrato, status de pagamento, permissões e dados publicados para consulta.

### Configuração local

1. Crie um projeto em [Supabase](https://supabase.com/dashboard)
2. No **SQL Editor**, execute o arquivo [`supabase/schema.sql`](supabase/schema.sql)
3. Em **Project Settings → API**, copie a URL e a `anon` key
4. Copie `.env.example` para `.env` e preencha:

```bash
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_SUPABASE_CONTRACT_ID=default
```

5. Reinicie `npm run dev`

### Tabela `contracts`

| Coluna | Tipo | Conteúdo |
|--------|------|----------|
| `id` | text | ID do contrato (`default`) |
| `seller` | jsonb | Vendedor |
| `buyer` | jsonb | Comprador |
| `property` | jsonb | Imóvel |
| `paid_numbers` | integer[] | Parcelas pagas |
| `payment_dates` | jsonb | Datas de pagamento |
| `consulta_permissions` | jsonb | Visibilidade na consulta |
| `published_consulta` | jsonb | Snapshot publicado |
| `updated_at` | timestamptz | Última atualização |

### GitHub Pages + Supabase

Adicione os secrets em **Settings → Secrets → Actions**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_CONTRACT_ID` (opcional; padrão `default`)

Sem as variáveis, o sistema funciona em modo **local** (dados no navegador).

## Estrutura do projeto

```
src/
├── components/     # UI e abas da aplicação
├── context/        # Provider do banco de dados
├── supabase/       # Cliente e repositório Supabase
├── data/           # Dados padrão do contrato
├── hooks/          # Estado do formulário e pagamentos
├── types/          # Tipos TypeScript
└── utils/          # PDF, HTML, formatadores e exportação
supabase/
└── schema.sql      # DDL + RLS + Realtime
```

## Publicar no GitHub

1. Crie um repositório vazio no GitHub (ex.: `recibos`)
2. Atualize a URL em `package.json` → campo `repository`
3. Execute:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/thiagod11lopes-ops/recibos.git
git push -u origin main
```

## Licença

[MIT](LICENSE)

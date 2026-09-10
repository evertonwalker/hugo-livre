# Contagem regressiva + comentários

Contagem regressiva para a liberdade de Hugo, no estilo do avengerscountdown.com
(fundo preto, tipografia condensada em caixa alta), com um mural de comentários
abaixo.

Stack: Vite + React 19 + Tailwind v4 no front, Serverless Functions em `/api`
e Redis (Upstash) como banco.

## Rodando local

```bash
npm install
npm run dev
```

As funções de `/api` rodam junto com o `npm run dev` (plugin `devApi` em
[vite.config.js](vite.config.js)). Sem as variáveis do Redis, os comentários
ficam em memória e um aviso aparece embaixo do formulário.

## Mudando a data

A data alvo fica em [src/config.js](src/config.js):

```js
const DEFAULT_TARGET_DATE = '2026-09-28T23:59:59-03:00'
```

Ou defina `VITE_TARGET_DATE` (ISO 8601 com fuso). Título, subtítulo e a mensagem
de fim também são configuráveis — veja [.env.example](.env.example).

O alvo é o **fim** do dia 28/09/2026, não a meia-noite que o inicia: assim o
contador marca 18 dias enquanto o dia 28 ainda não terminou. Se o horário certo
for outro (uma hora específica do dia 28, por exemplo), troque só essa linha.

> Variáveis `VITE_*` são lidas no **build**. Ao mudar na Vercel, faça um novo
> deploy para valer.

Os meses são contados pelo calendário, então "3 meses e 7 dias" bate com o que
se conta olhando o calendário, não em blocos de 30 dias.

## Deploy na Vercel

1. Suba o repositório e importe o projeto na Vercel (preset Vite é detectado
   automaticamente; `/api` vira Serverless Function sem configuração).
2. Crie o banco: **Storage > Create Database > Upstash for Redis** (tem plano
   gratuito). Conecte ao projeto — as variáveis `KV_REST_API_URL` e
   `KV_REST_API_TOKEN` são injetadas automaticamente.
3. Em **Settings > Environment Variables**, adicione `RESET_TOKEN` com uma
   string secreta qualquer (sem ela o endpoint de reset fica desativado).
4. Redeploy.

Por que não guardar em memória: cada Serverless Function roda em uma instância
efêmera, que escala a zero e pode ser recriada a qualquer momento — o que estava
em memória se perde e instâncias diferentes não veem os mesmos dados. Por isso o
Redis. `@upstash/redis` não é necessário: o [store](api/_store.js) fala com a API
REST usando só `fetch`, sem dependências.

## API

| Método | Rota | O que faz |
| --- | --- | --- |
| `GET` | `/api/comments` | Lista os comentários (mais recentes primeiro) |
| `POST` | `/api/comments` | Cria um comentário: `{ "name": "...", "message": "..." }` |
| `DELETE` | `/api/comments` | Apaga todos (header `x-reset-token`) |

Limites: nome com 40 caracteres, comentário com 500, no máximo 500 comentários
guardados (os mais antigos caem) e 8 comentários por minuto por IP.

## Resetando os comentários

```powershell
Invoke-WebRequest "https://SEU-PROJETO.vercel.app/api/comments" `
  -Method DELETE -Headers @{ "x-reset-token" = "SEU_RESET_TOKEN" }
```

```bash
curl -X DELETE https://SEU-PROJETO.vercel.app/api/comments \
  -H "x-reset-token: SEU_RESET_TOKEN"
```

Também é possível apagar a chave `hugo:comments` direto no console do Upstash.

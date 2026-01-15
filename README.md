# YouAre

**Demonstração ao Vivo: [youare.grupomurad.com](https://youare.grupomurad.com/)**

Uma demonstração de conscientização sobre privacidade que mostra quais informações os sites podem coletar sobre você através de fingerprinting de navegador e análise comportamental.

## Recursos

- **Fingerprinting de Navegador**: Canvas, WebGL, áudio, fontes e muito mais
- **Rastreamento Cross-Browser**: Identificação baseada em hardware que funciona entre diferentes navegadores
- **Rastreamento de Comportamento em Tempo Real**: Movimentos do mouse, padrões de scroll, comportamento de digitação
- **Detecção de Dispositivo**: GPU, núcleos da CPU, RAM, resolução da tela
- **Perfil com IA**: Usa OpenAI (GPT-4) como primário, com fallback para Grok e MiMo para inferir detalhes pessoais a partir de dados de fingerprint
- **Globo 3D Interativo**: Veja outros visitantes em tempo real com CesiumJS
- **Detecção de Privacidade**: VPN, bloqueador de anúncios, detecção de modo anônimo

## Stack Tecnológico

- **Frontend**: React + TypeScript + Vite
- **Backend**: Bun + Hono
- **Tempo Real**: WebSocket
- **Globo**: CesiumJS com tiles do OpenStreetMap
- **IA**: OpenAI (GPT-4) como primário, Grok (X.AI) e MiMo (OpenRouter) como fallbacks para perfil de usuário (opcional)
- **Cache**: Redis para cache de perfis e rastreamento de visitantes únicos (opcional)

## Começando

### Pré-requisitos

- Runtime [Bun](https://bun.sh/)
- Redis (opcional, para cache)
- Chave da API OpenAI (opcional, para perfil com IA - primário)
- Chave da API Grok (opcional, fallback)
- Chave da API OpenRouter (opcional, fallback)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/runawaydevil/youare.git
cd youare

# Instale as dependências
bun install

# Copie o arquivo de ambiente
cp .env.example .env

# Edite .env com sua configuração
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento (frontend + backend)
bun run dev
```

### Produção

```bash
# Construa o frontend
bun run build

# Inicie o servidor de produção
bun run server/index.ts
```

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `PORT` | Porta do servidor backend (padrão: 9945) | Sim |
| `VITE_WS_PORT` | Porta WebSocket para dev (padrão: 9945) | Sim |
| `REDIS_URL` | URL de conexão Redis | Não |
| `OPENAI_API_KEY` | Chave da API OpenAI para perfil com IA (primário) | Não |
| `OPENAI_MODEL` | Modelo OpenAI a usar (padrão: gpt-4-turbo-preview) | Não |
| `GROK_API_KEY` | Chave da API Grok para perfil com IA (fallback) | Não |
| `OPENROUTER_API_KEY` | Chave da API OpenRouter para perfil com IA (fallback) | Não |

## Quais Informações São Coletadas

### Hardware
- Resolução da tela, profundidade de cor, razão de pixels
- Núcleos da CPU, RAM (limitado a 8GB pelos navegadores)
- Fabricante e modelo da GPU
- Capacidade de tela touch

### Navegador
- User agent, plataforma, idioma
- Fontes instaladas
- Impressões digitais Canvas e WebGL
- Impressão digital de processamento de áudio
- Codecs e DRM suportados

### Comportamento
- Velocidade do mouse, aceleração, padrões de movimento
- Profundidade de scroll e mudanças de direção
- Velocidade de digitação e tempos de pressionamento de teclas
- Troca de abas e tempo de foco
- Cliques de raiva e intenção de saída

### Rede
- Endereço IP e geolocalização
- Tipo e velocidade de conexão
- IPs locais WebRTC
- Detecção de VPN/proxy

## Deploy

### Com nginx

```nginx
server {
    listen 443 ssl http2;
    server_name youare.example.com;

    location / {
        root /path/to/youare/dist;
        try_files $uri $uri/ /index.html;
    }

    location /ws {
        proxy_pass http://localhost:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3020;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Com PM2

```bash
pm2 start bun --name youare -- run server/index.ts
```

## Dicas de Privacidade

Esta demonstração tem como objetivo aumentar a conscientização sobre rastreamento online. Para proteger sua privacidade:

1. Use uma VPN para mascarar seu endereço IP
2. Habilite Não Rastrear no seu navegador
3. Use navegadores focados em privacidade como Firefox ou Brave
4. Instale extensões do navegador para bloquear fingerprinting
5. Desabilite WebRTC para prevenir vazamentos de IP local
6. Use o Tor Browser para máxima anonimidade

## Licença

MIT

## Créditos

Desenvolvido por **Grupo Murad** - 2026

Versão: 0.01

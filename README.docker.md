# Docker Compose - YouAre

Guia para executar o YouAre usando Docker Compose no domínio `you.observador.pro`.

## Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Acesso ao servidor onde o domínio `you.observador.pro` está configurado

## Estrutura

O Docker Compose cria três serviços:

1. **app**: Aplicação Bun + Hono (backend + frontend)
2. **redis**: Cache e tracking de visitantes únicos
3. **nginx**: Reverse proxy e servidor de arquivos estáticos

## Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.docker.example .env.docker
```

Edite `.env.docker` e configure:

- `GROK_API_KEY`: Chave da API Grok (opcional, para perfil com IA)
- `OPENROUTER_API_KEY`: Chave da API OpenRouter (opcional, fallback de IA)

### 2. Verificar Arquivo de Dados

Certifique-se de que o arquivo `data/GeoLite2-City.mmdb` existe. Este arquivo é necessário para geolocalização.

## Uso Básico

### Construir e Iniciar

```bash
# Construir imagens
npm run docker:build

# Iniciar todos os serviços
npm run docker:up

# Ver logs
npm run docker:logs
```

### Parar Serviços

```bash
npm run docker:down
```

### Reiniciar Serviços

```bash
npm run docker:restart
```

### Ver Status

```bash
npm run docker:ps
```

### Limpar Tudo (volumes e containers)

```bash
npm run docker:clean
```

## Configuração do Domínio

### DNS

Configure o DNS do domínio `you.observador.pro` para apontar para o IP do servidor onde o Docker está rodando.

### Portas

O nginx expõe as portas:
- **80**: HTTP
- **443**: HTTPS (quando SSL estiver configurado)

Certifique-se de que essas portas estão abertas no firewall do servidor.

## Configuração SSL/HTTPS

### Opção 1: Let's Encrypt (Recomendado)

1. Instale o Certbot no servidor host (não no container):

```bash
sudo apt-get update
sudo apt-get install certbot
```

2. Obtenha o certificado:

```bash
sudo certbot certonly --standalone -d you.observador.pro
```

3. Copie os certificados para o diretório do nginx:

```bash
sudo cp /etc/letsencrypt/live/you.observador.pro/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/you.observador.pro/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem
```

4. Descomente a seção HTTPS em `nginx/conf.d/youare.conf`

5. Comente ou remova o bloco HTTP ou configure o redirect

6. Reinicie o nginx:

```bash
npm run docker:restart nginx
```

### Opção 2: Certificados Externos

Se você já tem certificados SSL:

1. Coloque os arquivos em `nginx/ssl/`:
   - `fullchain.pem` (certificado completo)
   - `privkey.pem` (chave privada)

2. Descomente a seção HTTPS em `nginx/conf.d/youare.conf`

3. Reinicie o nginx

## Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

- **app**: `http://localhost:3020/health`
- **redis**: `redis-cli ping`
- **nginx**: `http://localhost/health`

### Logs

Ver logs de todos os serviços:

```bash
npm run docker:logs
```

Ver logs de um serviço específico:

```bash
docker-compose logs -f app
docker-compose logs -f redis
docker-compose logs -f nginx
```

## Troubleshooting

### Porta já em uso

Se as portas 80 ou 443 estiverem em uso, edite `docker-compose.yml` e altere o mapeamento:

```yaml
ports:
  - "8080:80"  # Use porta alternativa
  - "8443:443"
```

### Redis não conecta

Verifique se o Redis está saudável:

```bash
docker-compose exec redis redis-cli ping
```

Deve retornar `PONG`.

### Aplicação não inicia

Verifique os logs:

```bash
docker-compose logs app
```

Verifique se o arquivo `data/GeoLite2-City.mmdb` existe e está acessível.

### Nginx não serve arquivos estáticos

Verifique se o diretório `dist/` foi criado após o build:

```bash
ls -la dist/
```

Se não existir, faça o build localmente primeiro:

```bash
npm run build
```

Ou verifique os logs do container `app` para ver se o build foi bem-sucedido.

### WebSocket não funciona

Certifique-se de que o nginx está configurado corretamente para WebSocket. A configuração já está incluída em `nginx/conf.d/youare.conf`.

Verifique se os headers estão sendo passados:

```bash
docker-compose logs nginx | grep -i websocket
```

## Atualização

Para atualizar a aplicação:

```bash
# Parar serviços
npm run docker:down

# Reconstruir imagens
npm run docker:build

# Iniciar novamente
npm run docker:up
```

## Backup

### Redis

Para fazer backup dos dados do Redis:

```bash
docker-compose exec redis redis-cli BGSAVE
docker cp youare-redis:/data/dump.rdb ./backup/
```

### Arquivos Estáticos

Os arquivos estáticos estão em `dist/` e são gerados durante o build. Não é necessário backup separado.

## Produção

Para produção, considere:

1. **SSL/HTTPS**: Configure certificados SSL
2. **Firewall**: Configure regras de firewall adequadas
3. **Monitoramento**: Configure monitoramento e alertas
4. **Backup**: Configure backups automáticos do Redis
5. **Logs**: Configure rotação de logs
6. **Recursos**: Ajuste limites de CPU/memória no `docker-compose.yml` se necessário

## Suporte

Para problemas ou dúvidas, consulte:
- Logs dos containers
- Documentação do Docker Compose
- Documentação do nginx
- Documentação do Bun

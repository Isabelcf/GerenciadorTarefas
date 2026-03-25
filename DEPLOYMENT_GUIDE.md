# 🚀 Guia de Implantação de E-mail (Produção)

Este guia ajudará você a configurar o envio real de e-mails para o **TaskFlow** quando o projeto estiver finalizado.

## 1. Escolha um Provedor SMTP
Recomendamos o uso de serviços especializados para garantir que os e-mails não caiam no spam:
- **Resend** (Simples e Moderno)
- **SendGrid** (Robusto)
- **Mailgun**
- **Gmail** (Requer "Senhas de App")

## 2. Configuração no AI Studio
Vá no menu de **Settings** do AI Studio e adicione as seguintes variáveis de ambiente:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `SMTP_HOST` | Endereço do servidor SMTP | `smtp.resend.com` |
| `SMTP_PORT` | Porta (geralmente 587 ou 465) | `587` |
| `SMTP_USER` | Seu usuário/API Key | `resend` |
| `SMTP_PASS` | Sua senha/API Key | `re_123456789...` |
| `SMTP_FROM` | E-mail que aparecerá no remetente | `"TaskFlow Security" <security@seudominio.com>` |
| `APP_URL` | URL final do seu app | `https://seu-app.run.app` |

## 3. Como testar
Após configurar as variáveis:
1. Reinicie o servidor.
2. Tente recuperar a senha.
3. O servidor detectará automaticamente as configurações e enviará um e-mail real em vez de usar o modo de teste (Ethereal).

---
*Nota: Se as variáveis não forem preenchidas, o sistema continuará usando o **Ethereal** como fallback, imprimindo o link de visualização nos logs do servidor para que você nunca fique travado durante o desenvolvimento.*

# 🗺️ Guia de Estrutura do Projeto TaskFlow

Este guia explica a função de cada arquivo na raiz do projeto, especialmente aqueles que não permitem comentários internos (como arquivos JSON).

## 📂 Arquivos de Configuração (Raiz)

### 1. `metadata.json`
*   **O que é:** Um arquivo específico da plataforma Google AI Studio.
*   **Para que serve:** Define o nome da aplicação, a descrição que aparece no painel e as permissões de hardware (câmera, microfone, localização) que o app solicita ao navegador.
*   **Nota:** Não aceita comentários.

### 2. `package.json`
*   **O que é:** O manifesto do seu projeto Node.js.
*   **Para que serve:** Lista todas as bibliotecas (dependências) que o projeto usa, define os comandos de execução (scripts como `npm run dev`) e contém metadados como versão e nome do autor.
*   **Nota:** Não aceita comentários.

### 3. `package-lock.json`
*   **O que é:** Um registro detalhado das dependências.
*   **Para que serve:** Garante que todas as pessoas que baixarem o projeto instalem exatamente as mesmas versões das bibliotecas, evitando o erro "na minha máquina funciona".
*   **Aviso:** **Nunca edite este arquivo manualmente.** Ele é gerenciado automaticamente pelo comando `npm install`.

### 4. `tsconfig.json`
*   **O que é:** Configuração do compilador TypeScript.
*   **Para que serve:** Define como o código TypeScript deve ser convertido para JavaScript, quais regras de segurança aplicar e como resolver os caminhos de importação (como o atalho `@/`).

### 5. `vite.config.ts`
*   **O que é:** Configuração do Vite (nosso motor de desenvolvimento).
*   **Para que serve:** Configura o servidor local, os plugins do React e do Tailwind, e gerencia como os arquivos são "empacotados" para produção.

### 6. `server.ts`
*   **O que é:** Nosso servidor Backend (Express).
*   **Para que serve:** Gerencia as rotas da API, a conexão com o banco de dados SQLite e a autenticação de usuários.

### 7. `.env.example`
*   **O que é:** Um modelo de variáveis de ambiente.
*   **Para que serve:** Mostra quais chaves secretas (como o `JWT_SECRET`) são necessárias para o app funcionar, sem expor os valores reais publicamente.

### 8. `.gitignore`
*   **O que é:** Lista de exclusão do Git.
*   **Para que serve:** Diz ao Git quais arquivos **não** devem ser enviados para o repositório (como a pasta `node_modules` ou arquivos de senhas `.env`).

---

## 📂 Pastas Principais

*   **`/src`**: Contém todo o código-fonte da interface (Frontend).
*   **`/src/components`**: Peças reutilizáveis da interface (Botões, Cards, Modais).
*   **`/src/pages`**: As telas completas da aplicação.
*   **`/src/lib`**: Funções utilitárias e configurações de bibliotecas.

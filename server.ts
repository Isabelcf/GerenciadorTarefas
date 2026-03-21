/**
 * ARQUIVO: SERVER.TS
 * 
 * Este é o coração do seu Backend. Ele utiliza Express (um framework para Node.js)
 * para criar uma API que gerencia usuários e autenticação.
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';

/* Carrega as variáveis do arquivo .env para o process.env */
dotenv.config();

/* Configurações de caminho para módulos ES */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CONFIGURAÇÃO DO BANCO DE DADOS (SQLite)
 * Utilizamos o SQLite por ser um banco de dados local, leve e que não requer servidor externo.
 * O arquivo 'database.db' será criado automaticamente na raiz.
 */
const db = new Database('database.db');

/* Criação da tabela de usuários caso ela não exista */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * MIGRAÇÕES DE BANCO DE DADOS
 * Este bloco garante que, se adicionarmos novas colunas no futuro, elas sejam 
 * criadas automaticamente sem apagar os dados existentes.
 */
const columns = db.prepare("PRAGMA table_info(users)").all() as any[];
const columnNames = columns.map(c => c.name);

const migrations = [
  { name: 'full_name', type: 'TEXT' },
  { name: 'email', type: 'TEXT' },
  { name: 'birth_date', type: 'TEXT' },
  { name: 'two_factor_enabled', type: 'INTEGER DEFAULT 0' }
];

migrations.forEach(m => {
  if (!columnNames.includes(m.name)) {
    console.log(`Adicionando coluna ${m.name} à tabela users...`);
    db.exec(`ALTER TABLE users ADD COLUMN ${m.name} ${m.type}`);
  }
});

/**
 * FUNÇÃO PRINCIPAL: startServer
 * Inicializa o servidor Express e configura as rotas da API.
 */
async function startServer() {
  const app = express();
  const PORT = 3000;
  /* Chave secreta para o JWT (Token de Autenticação) */
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

  /* Middlewares: CORS permite acesso de outros domínios, JSON permite ler corpos de requisição */
  app.use(cors());
  app.use(express.json());

  // --- ROTAS DE AUTENTICAÇÃO ---

  /**
   * ROTA: POST /api/auth/register
   * Cria um novo usuário no sistema.
   */
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, fullName, email, birthDate } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    try {
      /* Criptografa a senha antes de salvar (Segurança!) */
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const insert = db.prepare('INSERT INTO users (username, password, full_name, email, birth_date) VALUES (?, ?, ?, ?, ?)');
      insert.run(username, hashedPassword, fullName || null, email || null, birthDate || null);

      res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Este nome de usuário já está em uso' });
      }
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  /**
   * ROTA: POST /api/auth/login
   * Valida as credenciais e retorna um Token JWT.
   */
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      /* Compara a senha digitada com a senha criptografada no banco */
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      /* Gera o Token JWT que expira em 24 horas */
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          birthDate: user.birth_date,
          twoFactorEnabled: !!user.two_factor_enabled
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  });

  /**
   * MIDDLEWARE: authenticateToken
   * Verifica se o usuário está logado antes de permitir acesso a rotas protegidas.
   */
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
      req.user = user;
      next();
    });
  };

  /**
   * ROTA: GET /api/auth/me
   * Retorna os dados do usuário logado baseado no Token.
   */
  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    try {
      const user: any = db.prepare('SELECT id, username, full_name, email, birth_date, two_factor_enabled FROM users WHERE id = ?').get(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          birthDate: user.birth_date,
          twoFactorEnabled: !!user.two_factor_enabled
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  });

  /**
   * ROTA: POST /api/auth/forgot-password
   * Verifica se o usuário existe por username ou e-mail.
   */
  app.post('/api/auth/forgot-password', (req, res) => {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Identificador é obrigatório' });
    }

    try {
      /* Busca o usuário por username OU e-mail */
      const user: any = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(identifier, identifier);

      if (!user) {
        /* Retorna 404 se não encontrar, para que o front exiba a mensagem de "não cadastrado" */
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      /* Simulação de envio de e-mail */
      console.log(`[RECOVERY] Enviando e-mail para: ${user.email || user.username}`);
      
      res.json({ message: 'Instruções de recuperação enviadas' });
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  });

  /**
   * ROTA: POST /api/integrations/sync
   * Mock de sincronização com plataformas externas (Trello, Jira, etc).
   */
  app.post('/api/integrations/sync', (req, res) => {
    /* Simulação de tarefas vindas de fora com comentários */
    const mockIntegratedTasks = [
      {
        id: 'external-task-1',
        title: 'Revisar Protótipo (Trello)',
        description: 'Tarefa importada do board de Design no Trello.',
        category: 'trabalho',
        priority: 'high',
        completed: false,
        inProgress: true,
        createdAt: Date.now() - 86400000,
        source: 'trello',
        comments: [
          {
            id: 'ext-comment-1',
            text: 'O cliente pediu para mudar a cor do botão para azul.',
            createdAt: Date.now() - 3600000,
            author: 'João (Trello)'
          }
        ]
      },
      {
        id: 'external-task-2',
        title: 'Bug no Login (Jira)',
        description: 'Erro reportado no ambiente de produção.',
        category: 'trabalho',
        priority: 'high',
        completed: false,
        createdAt: Date.now() - 172800000,
        source: 'jira',
        comments: [
          {
            id: 'ext-comment-2',
            text: 'Já identifiquei o problema no log do servidor.',
            createdAt: Date.now() - 7200000,
            author: 'Admin (Jira)'
          }
        ]
      }
    ];

    res.json({ tasks: mockIntegratedTasks });
  });

  /**
   * INTEGRAÇÃO COM VITE
   * Em desenvolvimento, o Express usa o middleware do Vite para servir o Frontend.
   * Em produção, ele serve os arquivos estáticos da pasta 'dist'.
   */
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  /* Inicia a escuta do servidor na porta 3000 */
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();

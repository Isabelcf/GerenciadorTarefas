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
import speakeasy from 'speakeasy';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

/* 
 * INICIALIZAÇÃO DO BANCO DE DADOS
 * Criamos as tabelas se elas não existirem.
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    birth_date TEXT,
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT,
    completed INTEGER DEFAULT 0,
    in_progress INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    source TEXT DEFAULT 'local',
    data TEXT, -- JSON string para campos complexos (checklist, history, comments, attachments)
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

/**
 * FUNÇÃO PRINCIPAL: startServer
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
   * Cria um novo usuário no sistema com política de senha.
   */
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, fullName, email, birthDate } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    /* POLÍTICA DE SENHA: Mínimo 8 caracteres, pelo menos uma letra e um número */
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.' 
      });
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
   * Valida as credenciais e retorna um Token JWT ou solicita 2FA.
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

      /* Se o 2FA estiver habilitado, não envia o token ainda */
      if (user.two_factor_enabled) {
        return res.json({ 
          requires2FA: true, 
          userId: user.id,
          message: 'Autenticação de dois fatores necessária' 
        });
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
   * ROTA: POST /api/auth/login/2fa
   * Verifica o código 2FA para completar o login.
   */
  app.post('/api/auth/login/2fa', async (req, res) => {
    const { userId, code } = req.body;

    try {
      const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
        return res.status(400).json({ error: '2FA não configurado para este usuário' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code
      });

      if (!verified) {
        return res.status(401).json({ error: 'Código 2FA inválido' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          fullName: user.full_name 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro na verificação 2FA' });
    }
  });

  /**
   * ROTA: POST /api/auth/forgot-password
   * Gera um token de recuperação e "envia" por e-mail.
   */
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { identifier } = req.body;

    try {
      const user: any = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hora

      db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
        .run(resetToken, expires, user.id);

      /* 
       * CONFIGURAÇÃO DE E-MAIL (PRODUÇÃO)
       * Tenta usar as variáveis de ambiente para envio real.
       * Se não houver configuração, apenas loga o link no console para segurança e performance.
       */
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
      
      const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

      if (isSmtpConfigured) {
        // Configuração Real de Produção
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"TaskFlow Security" <security@taskflow.com>',
          to: user.email,
          subject: 'Redefinição de Senha - TaskFlow',
          text: `Olá Herói! Clique no link para redefinir sua senha: ${resetLink}`,
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8fafc; color: #1e293b;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <h1 style="color: #1e40af; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em;">TaskFlow Security</h1>
                <p style="font-size: 18px; font-weight: 600; margin-top: 24px;">Olá Herói!</p>
                <p style="font-size: 16px; line-height: 1.6; color: #64748b;">Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para escolher uma nova chave de acesso:</p>
                <div style="margin-top: 32px;">
                  <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background: #1e40af; color: white; text-decoration: none; border-radius: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 0 0 #1e3a8a;">Redefinir Senha</a>
                </div>
                <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Se você não solicitou isso, pode ignorar este e-mail com segurança. O link expira em 1 hora.</p>
              </div>
            </div>
          `,
        });
      } else {
        // Fallback: Apenas loga no console para evitar overhead de criar contas de teste
        console.log('--------------------------------------------------');
        console.log('[SECURITY INFO] SMTP não configurado.');
        console.log(`[RECOVERY LINK] Para o usuário ${user.username}: ${resetLink}`);
        console.log('--------------------------------------------------');
      }

      res.json({ message: 'Instruções de recuperação enviadas' });
    } catch (error) {
      console.error('Erro no forgot-password:', error);
      res.status(500).json({ error: 'Erro ao processar recuperação' });
    }
  });

  /**
   * ROTA: POST /api/auth/reset-password
   * Altera a senha usando o token de recuperação.
   */
  app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      const user: any = db.prepare('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?').get(token, new Date().toISOString());

      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      /* POLÍTICA DE SENHA */
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          error: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.' 
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
        .run(hashedPassword, user.id);

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao resetar senha' });
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
   * ROTA: PUT /api/auth/profile
   * Atualiza os dados do perfil do usuário.
   */
  app.put('/api/auth/profile', authenticateToken, (req: any, res) => {
    const { fullName, email, birthDate } = req.body;

    try {
      db.prepare('UPDATE users SET full_name = ?, email = ?, birth_date = ? WHERE id = ?')
        .run(fullName, email, birthDate, req.user.id);

      res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  });

  /**
   * ROTA: POST /api/auth/2fa/setup
   * Gera um segredo para configuração do 2FA.
   */
  app.post('/api/auth/2fa/setup', authenticateToken, (req: any, res) => {
    try {
      const secret = speakeasy.generateSecret({ name: `TaskFlow (${req.user.username})` });
      
      db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?')
        .run(secret.base32, req.user.id);

      res.json({ 
        secret: secret.base32,
        otpauth_url: secret.otpauth_url 
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao configurar 2FA' });
    }
  });

  /**
   * ROTA: POST /api/auth/2fa/verify
   * Verifica o código e habilita o 2FA.
   */
  app.post('/api/auth/2fa/verify', authenticateToken, (req: any, res) => {
    const { code } = req.body;

    try {
      const user: any = db.prepare('SELECT two_factor_secret FROM users WHERE id = ?').get(req.user.id);

      if (!user.two_factor_secret) {
        return res.status(400).json({ error: 'Segredo 2FA não gerado' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code
      });

      if (verified) {
        db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?').run(req.user.id);
        res.json({ message: '2FA habilitado com sucesso' });
      } else {
        res.status(400).json({ error: 'Código inválido' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar 2FA' });
    }
  });

  /**
   * ROTA: POST /api/auth/2fa/disable
   * Desabilita o 2FA.
   */
  app.post('/api/auth/2fa/disable', authenticateToken, (req: any, res) => {
    try {
      db.prepare('UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?').run(req.user.id);
      res.json({ message: '2FA desabilitado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desabilitar 2FA' });
    }
  });

  // --- ROTAS DE TAREFAS (ISOLAMENTO POR USUÁRIO) ---

  /**
   * ROTA: GET /api/tasks
   * Retorna apenas as tarefas do usuário autenticado.
   */
  app.get('/api/tasks', authenticateToken, (req: any, res) => {
    try {
      const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id) as any[];
      
      const formattedTasks = tasks.map(t => {
        const extraData = t.data ? JSON.parse(t.data) : {};
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          completed: !!t.completed,
          inProgress: !!t.in_progress,
          createdAt: t.created_at,
          source: t.source,
          ...extraData
        };
      });

      res.json({ tasks: formattedTasks });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
  });

  /**
   * ROTA: POST /api/tasks
   * Cria uma nova tarefa vinculada ao usuário logado.
   */
  app.post('/api/tasks', authenticateToken, (req: any, res) => {
    const { id, title, description, category, priority, completed, inProgress, createdAt, source, ...extraData } = req.body;

    try {
      const insert = db.prepare(`
        INSERT INTO tasks (id, user_id, title, description, category, priority, completed, in_progress, created_at, source, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        id,
        req.user.id,
        title,
        description || '',
        category || 'outros',
        priority || 'medium',
        completed ? 1 : 0,
        inProgress ? 1 : 0,
        createdAt || Date.now(),
        source || 'local',
        JSON.stringify(extraData)
      );

      res.status(201).json({ message: 'Tarefa criada' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
  });

  /**
   * ROTA: PUT /api/tasks/:id
   * Atualiza uma tarefa (apenas se pertencer ao usuário).
   */
  app.put('/api/tasks/:id', authenticateToken, (req: any, res) => {
    const updateData = req.body;
    const taskId = req.params.id;

    try {
      const existing: any = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id);
      if (!existing) return res.status(404).json({ error: 'Tarefa não encontrada' });

      /* 
       * Mapeamento de campos:
       * O frontend usa camelCase (inProgress, createdAt)
       * O banco usa snake_case (in_progress, created_at)
       * O campo 'data' no banco armazena o que sobrar (extraData)
       */
      
      // Extraímos os dados extras do JSON atual para mesclar com os novos
      const currentExtraData = existing.data ? JSON.parse(existing.data) : {};
      
      // Mesclamos tudo: banco + extra atual + novos dados do frontend
      const merged = { ...existing, ...currentExtraData, ...updateData };

      // Destruturamos para separar o que vai nas colunas do que vai no JSON 'data'
      const {
        id, user_id, // campos internos do banco
        title, description, category, priority, source,
        completed, in_progress, inProgress,
        created_at, createdAt,
        data, // removemos a string JSON antiga
        ...extraData
      } = merged;

      // Decidimos os valores finais priorizando o que veio do frontend (camelCase)
      const finalCompleted = completed !== undefined ? (typeof completed === 'boolean' ? (completed ? 1 : 0) : completed) : existing.completed;
      const finalInProgress = inProgress !== undefined ? (inProgress ? 1 : 0) : existing.in_progress;
      const finalCreatedAt = createdAt !== undefined ? createdAt : existing.created_at;

      const update = db.prepare(`
        UPDATE tasks 
        SET title = ?, description = ?, category = ?, priority = ?, completed = ?, in_progress = ?, created_at = ?, source = ?, data = ?
        WHERE id = ? AND user_id = ?
      `);

      update.run(
        title || existing.title,
        description !== undefined ? description : existing.description,
        category || existing.category,
        priority || existing.priority,
        finalCompleted,
        finalInProgress,
        finalCreatedAt,
        source || existing.source,
        JSON.stringify(extraData),
        taskId,
        req.user.id
      );

      res.json({ message: 'Tarefa atualizada' });
    } catch (error) {
      console.error('Erro ao atualizar tarefa (ID:', taskId, '):', error);
      res.status(500).json({ error: 'Erro ao atualizar tarefa: ' + (error instanceof Error ? error.message : String(error)) });
    }
  });

  /**
   * ROTA: DELETE /api/tasks/:id
   * Remove uma tarefa do usuário.
   */
  app.delete('/api/tasks/:id', authenticateToken, (req: any, res) => {
    const taskId = req.params.id;

    try {
      const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, req.user.id);
      if (result.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
      res.json({ message: 'Tarefa excluída' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir tarefa' });
    }
  });

  /**
   * ROTA: POST /api/integrations/sync
   * Mock de sincronização com plataformas externas (Trello, Jira, etc).
   */
  app.post('/api/integrations/sync', (req, res) => {
    const { apiKeys } = req.body;
    
    /* Verifica se existe pelo menos uma chave de API com valor preenchido */
    const hasActiveIntegration = apiKeys && Object.values(apiKeys).some((config: any) => 
      Object.values(config).some((val: any) => typeof val === 'string' && val.trim().length > 0)
    );

    /* Se não houver chaves de API configuradas ou todas estiverem vazias, retorna lista vazia */
    if (!hasActiveIntegration) {
      return res.json({ tasks: [] });
    }

    /* 
     * NOTA: Em um sistema real, aqui faríamos chamadas para as APIs do Trello, Jira, etc.
     * Por enquanto, retornamos uma lista vazia para evitar "informações inventadas".
     */
    const integratedTasks: any[] = [];

    res.json({ tasks: integratedTasks });
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
      logLevel: 'error',
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

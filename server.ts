import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database Setup ---
// We use SQLite for a local, private, and "detached" database.
const db = new Database('database.db');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add missing columns if they don't exist
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
    console.log(`Adding column ${m.name} to users table...`);
    db.exec(`ALTER TABLE users ADD COLUMN ${m.name} ${m.type}`);
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

  app.use(cors());
  app.use(express.json());

  // --- Auth Routes ---

  // 1. Register
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, fullName, email, birthDate } = req.body;
    console.log('Register attempt:', { username, fullName, email, birthDate });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    try {
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

  // 2. Login
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username);

    try {
      const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

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

  // --- Protected Route Example ---
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

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    console.log('Fetch profile for user ID:', req.user.id);
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

  // --- Vite Middleware ---
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

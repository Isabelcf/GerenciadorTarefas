/**
 * ARQUIVO: APP.TSX
 * 
 * Este é o componente raiz da aplicação. Ele configura o roteamento,
 * as notificações globais (Toaster) e a lógica de proteção de rotas.
 * 
 * Estrutura:
 * - BrowserRouter: Gerencia o histórico de navegação.
 * - Toaster: Componente que exibe mensagens flutuantes (sucesso, erro).
 * - Routes: Define quais componentes renderizar para cada URL.
 * - ProtectedRoute: Um wrapper que verifica se o usuário está logado antes de permitir o acesso.
 */

import React from 'react';
/* Importação de componentes do React Router para navegação */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
/* Importação do componente de notificações Toast */
import { Toaster } from 'sonner';
/* Importação das páginas da aplicação */
import Dashboard from '@/src/pages/Dashboard';
import Login from '@/src/pages/Login';
import Signup from '@/src/pages/Signup';
import Profile from '@/src/pages/Profile';
import Calendar from '@/src/pages/Calendar';

/**
 * COMPONENTE: ProtectedRoute
 * Verifica se existe um token de autenticação no LocalStorage.
 * Se não existir, redireciona o usuário para a página de login.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  /* Tenta recuperar o token salvo no navegador */
  const token = localStorage.getItem('token');
  
  /* Se não houver token, redireciona para /login */
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  /* Se houver token, renderiza o componente filho (a página protegida) */
  return <>{children}</>;
};

/**
 * COMPONENTE PRINCIPAL: App
 * Define a malha de rotas da aplicação.
 */
export default function App() {
  return (
    <Router>
      {/* Configuração global das notificações Toast */}
      <Toaster position="top-right" richColors closeButton />
      
      <Routes>
        {/* Rota Principal: Protegida, exibe o Dashboard */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Rotas Públicas: Login e Cadastro */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Rotas Protegidas: Perfil e Calendário */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        
        {/* Fallback: Qualquer rota não definida redireciona para a raiz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

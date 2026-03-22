/**
 * ARQUIVO: MAIN.TSX
 * 
 * Este é o ponto de entrada principal da aplicação React.
 * Ele é responsável por renderizar o componente raiz <App /> no elemento DOM 'root'.
 * 
 * Importações:
 * - StrictMode: Ferramenta para destacar problemas potenciais na aplicação.
 * - createRoot: API do React 18 para inicializar o renderizador.
 * - index.css: Estilos globais e configurações do Tailwind CSS.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

/* Inicializa a aplicação React no elemento com ID 'root' definido no index.html */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        {/* Renderiza o componente principal que contém as rotas e lógica global */}
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);

/**
 * ARQUIVO: VITE.CONFIG.TS
 * 
 * Configuração principal do Vite, o bundler e servidor de desenvolvimento da aplicação.
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  /* Carrega as variáveis de ambiente baseadas no modo (dev/prod) */
  const env = loadEnv(mode, '.', '');
  
  return {
    /* Plugins: React para suporte ao framework e Tailwind para estilização */
    plugins: [react(), tailwindcss()],
    
    /* Define variáveis globais acessíveis no código do cliente */
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    /* Configuração de caminhos (alias) para facilitar as importações */
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    
    /* Configurações do servidor de desenvolvimento */
    server: {
      /* 
         O HMR (Hot Module Replacement) é desabilitado no AI Studio para evitar 
         flickering enquanto o agente edita os arquivos.
      */
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

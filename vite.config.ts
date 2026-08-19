import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Production fallbacks - used when env file is not present (e.g. Vercel build)
    const PROD = {
        VITE_SUPABASE_URL:       'https://zuqqutdhvxxqwulcwqjm.supabase.co',
        VITE_SUPABASE_ANON_KEY:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cXF1dGRodnh4cXd1bGN3cWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjMzNTMsImV4cCI6MjA4NDI5OTM1M30.DybgltfCtLl3yfbuttvKXvKl9g6C_iXUTeDqFSfUCXs',
        VITE_APP_URL:            'https://it-support-dashboard.vercel.app',
        VITE_TELEGRAM_BOT_TOKEN: '8853646983:AAEkQNVqmPS2bh6uWEjqwUgP84rnuZ9Sfyg',
        VITE_TELEGRAM_CHAT_ID:   '1043546954',
    };

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY':                  JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY':           JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_SUPABASE_URL':    JSON.stringify(env.VITE_SUPABASE_URL      || PROD.VITE_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || PROD.VITE_SUPABASE_ANON_KEY),
        'import.meta.env.VITE_APP_URL':         JSON.stringify(env.VITE_APP_URL            || PROD.VITE_APP_URL),
        'import.meta.env.VITE_TELEGRAM_BOT_TOKEN': JSON.stringify(env.VITE_TELEGRAM_BOT_TOKEN || PROD.VITE_TELEGRAM_BOT_TOKEN),
        'import.meta.env.VITE_TELEGRAM_CHAT_ID': JSON.stringify(env.VITE_TELEGRAM_CHAT_ID  || PROD.VITE_TELEGRAM_CHAT_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

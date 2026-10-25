import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import chatHandler from './api/chat';
import gtfsRtHandler from './api/gtfs-rt';

// Vite config with Vercel serverless /api handlers mounted in dev
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Populate process.env for Node dependencies
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  // Print startup verification: defined status only, never the value
  const hasGeminiKey = Boolean(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY);
  const hasAnthropicKey = Boolean(env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY);
  console.log(`[Stationmaster Server Startup] GEMINI_API_KEY is defined: ${hasGeminiKey}`);
  console.log(`[Stationmaster Server Startup] ANTHROPIC_API_KEY is defined: ${hasAnthropicKey}`);

  return {
    plugins: [
      react(),
      {
        name: 'stationmaster-serverless-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req, res) => {
            chatHandler(req, res);
          });
          server.middlewares.use('/api/gtfs-rt', (req, res) => {
            gtfsRtHandler(req, res);
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/chat', (req, res) => {
            chatHandler(req, res);
          });
          server.middlewares.use('/api/gtfs-rt', (req, res) => {
            gtfsRtHandler(req, res);
          });
        }
      }
    ],
    server: {
      port: 5173,
      host: true,
      watch: {
        ignored: ['**/data/**', '**/*.zip', '**/scripts/**']
      }
    }
  };
});

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import webhookRouter from './pages/api/webhook';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve API routes
app.use('/api', webhookRouter);

// Serve frontend static files
const clientBuildPath = path.resolve(__dirname, '../client-dist'); // Make sure this matches vite build output
app.use(express.static(clientBuildPath));

// Serve index.html on any unknown route (for React Router)
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

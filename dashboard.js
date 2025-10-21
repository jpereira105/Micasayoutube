// dashboard.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const app = express();
const PORT = 4000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  const tokenPath = path.resolve('token.json');
  const verifierPath = path.resolve('verifier.json');

  let tokenData = 'No hay token guardado';
  let verifierData = 'No hay code_verifier';

  if (fs.existsSync(tokenPath)) {
    tokenData = JSON.stringify(JSON.parse(fs.readFileSync(tokenPath)), null, 2);
  }

  if (fs.existsSync(verifierPath)) {
    verifierData = JSON.stringify(JSON.parse(fs.readFileSync(verifierPath)), null, 2);
  }

  res.send(`
    <html>
      <head>
        <title>Dashboard OAuth2</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
          h1 { color: #333; }
          pre { background: #fff; padding: 10px; border: 1px solid #ccc; overflow-x: auto; }
          .section { margin-bottom: 30px; }
          button { padding: 10px 20px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>🔐 Dashboard OAuth2 + Scraping</h1>

        <div class="section">
          <h2>📦 Token actual</h2>
          <pre>${tokenData}</pre>
        </div>

        <div class="section">
          <h2>🧪 Code Verifier</h2>
          <pre>${verifierData}</pre>
        </div>

        <div class="section">
          <h2>🚀 Acciones</h2>
          <form action="/start" method="POST">
            <button type="submit">Iniciar flujo OAuth</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

app.post('/start', (req, res) => {
  //const { exec } = require('child_process');
  
  exec('node startOAuthFlow.js', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error al iniciar flujo:', err.message);
      return res.send('Error al iniciar flujo');
    }
    console.log(stdout);
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`📊 Dashboard disponible en http://localhost:${PORT}`);
});

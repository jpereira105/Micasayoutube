// startOAuthFlow.js
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

if (!CLIENT_ID || !REDIRECT_URI) {
  console.error("❌ Faltan CLIENT_ID o REDIRECT_URI en el .env");
  process.exit(1);
}

// 1️⃣ Generar code_verifier y code_challenge
const code_verifier = crypto.randomBytes(32).toString('hex');
const hash = crypto.createHash('sha256').update(code_verifier).digest();
const code_challenge = hash.toString('base64url');

// 2️⃣ Guardar code_verifier
fs.writeFileSync('verifier.json', JSON.stringify({ code_verifier }));
console.log('🔐 code_verifier guardado en verifier.json');

// 3️⃣ Armar URL de autorización
const authURL = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge=${code_challenge}&code_challenge_method=S256`;

console.log('🌐 URL de autorización generada:');
console.log(authURL);

// 4️⃣ Abrir URL en navegador
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(authURL, { waitUntil: 'networkidle2' });
  console.log('🚀 Navegador abierto con la URL de autorización');
})();
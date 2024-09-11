import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';  // Importar o pacote CORS
import dotenv from 'dotenv';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

const app = express();
const port = process.env.PORT || 3001;


// Configurar CORS
app.use(cors({
    origin: '*',  // Permitir solicitações de qualquer origem. Ajuste conforme necessário.
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
}));

// Rota de proxy para a primeira API de consulta (sem token)
app.get('/proxy/consulta/:cnpj', async (req, res) => {
    const { cnpj } = req.params;
    const apiUrl = `https://www.sistemaempresarialweb.com.br/backupsoften/consulta/${cnpj}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Erro ao acessar a API');
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar a API.' });
    }
});

// Rota de proxy para a segunda API de consulta (com token)
app.post('/proxy/release/:cnpj', async (req, res) => {
    const { cnpj } = req.params;
    const apiUrl = 'https://api.sistemaempresarialweb.com.br/release/monthly';
    console.log(`Consultando API 2 com CNPJ: ${cnpj}`); // Log do CNPJ

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                document: cnpj,
                origin: 'SIEM',
                token: process.env.API_TOKEN_SECOND // O token será enviado no corpo da requisição
            })
        });

        if (!response.ok) {
            console.error(`Erro ao acessar a API 2. Status: ${response.status}`); // Log do status
            throw new Error('Erro ao acessar a API');
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Erro ao consultar a API 2: ${error.message}`);
        res.status(500).json({ error: 'Erro ao consultar a API.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor proxy rodando na porta ${port}`);
});

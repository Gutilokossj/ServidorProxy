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

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN_SECOND}` // Incluindo o token da variável de ambiente
            },
            body: JSON.stringify({
                document: cnpj,
                origin: 'SIEM',
                token: process.env.API_TOKEN_SECOND // Se a API exige o token no corpo da requisição
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao acessar a API');
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar a API.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor proxy rodando na porta ${port}`);
});

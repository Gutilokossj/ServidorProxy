import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3001;

// Rota de proxy para a API de consulta
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

app.listen(port, () => {
    console.log(`Servidor proxy rodando na porta ${port}`);
});


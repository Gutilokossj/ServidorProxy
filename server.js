import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';  // Importar o pacote CORS

const app = express();
const port = process.env.PORT || 3001;

// Configurar CORS
app.use(cors({
    origin: '*',  // Permitir solicitações de qualquer origem. Ajuste conforme necessário.
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
}));

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

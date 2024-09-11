import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';  // Importar o pacote CORS
import dotenv from 'dotenv';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Adiciona middleware para interpretar JSON


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
app.post('/proxy/release/', async (req, res) => {
    const { document, origin } = req.body;

    if (!document || !origin || !process.env.API_TOKEN_SECOND) {
        return res.status(400).json({ error: 'Document, origin, and token are required' });
    }

     // Formatar o CNPJ
     const formattedCNPJ = formatCNPJ(document);

    const apiUrl = 'https://api.sistemaempresarialweb.com.br/release/monthly';

    // Certifique-se de que o corpo da requisição está correto
    const requestBody = {
        document: formattedCNPJ,  // O CNPJ formatado deve ser passado diretamente
        origin: origin,
        token: process.env.API_TOKEN_SECOND // O token será enviado no corpo da requisição
    };

    console.log('Corpo da requisição para API 2:', JSON.stringify(requestBody));

    try {
        const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)  // Certifique-se de que o requestBody está correto
});

        console.log('Status da resposta da API 2:', response.status);
        
        if (!response.ok) {
            throw new Error('Erro ao consultar a API 2');
        }

        const data = await response.json();
        console.log('Dados retornados pela API 2:', data);

        res.json(data); // Retorna a resposta da API 2 para o cliente
    } catch (error) {
        console.error('Erro ao consultar a API 2:', error);
        res.status(500).json({ error: 'Erro ao consultar a API.' });
    }
});

const formatCNPJ = (cnpj) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};


app.listen(port, () => {
    console.log(`Servidor proxy rodando na porta ${port}`);
});

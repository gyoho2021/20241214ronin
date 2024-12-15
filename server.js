const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');

const app = express();
const PORT = 3000;

// CORS対応
app.use(cors());
app.use(bodyParser.json());

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));


// APIプロキシエンドポイント
app.post('/api/proxy', async (req, res) => {
    console.log('Received request:', req.body); // リクエスト内容をログに出力
    try {
        const response = await fetch('https://graphql-gateway.axieinfinity.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching Axie data:', error);
        res.status(500).json({ error: 'Failed to fetch Axie data' });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// ノンス管理用（簡易）
const nonces = {};

// ノンス取得エンドポイント
app.get('/api/getNonce', (req, res) => {
    const nonce = Math.floor(Math.random() * 1000000).toString();
    nonces[nonce] = true;
    res.json({ nonce });
});

// ログインエンドポイント
app.post('/api/login', (req, res) => {
    const { address, signature, nonce } = req.body;
    if (!nonces[nonce]) {
        return res.json({ success: false, message: 'Invalid nonce' });
    }
    delete nonces[nonce];

    const message = `Login request nonce: ${nonce}`;
    try {
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            // JWTなどのトークンを発行する場合はここで生成
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Signature verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Signature verification error' });
    }
});

// Axie取得エンドポイント
app.post('/api/getAxies', async (req, res) => {
    const { owner } = req.body;

    const query = `
        query GetAxieBriefList($owner: String!) {
    axies(owner: $owner, from: 0, size: 10) {
        total
        results {
            id
            name
            image
            class
            breedCount
            stage
        }
    }
}
    `;

    try {
        const response = await fetch('https://graphql-gateway.axieinfinity.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { owner } })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: [{ message: 'Internal Server Error' }] });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

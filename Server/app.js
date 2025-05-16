const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const routes = require('./routes');
const app = express();
const port = process.env.PORT || 3000;

// Configura o Express para servir arquivos estáticos da pasta public/
app.use(express.static(path.join(__dirname, '../public')));

// Redireciona a raiz (/) para index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Configura o corpo das requisições como JSON
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Configuração do WebSocket
const wss = new WebSocket.Server({ noServer: true });
const users = new Map();
const autoResponses = [
    'Que bom te conhecer! Como está seu dia?',
    'Você tem alguma memória especial para compartilhar?',
    'Estou aqui para conversar! O que está pensando?',
    'Você já usou o recurso de registrar memórias? É bem legal!',
    'Última mensagem automática! Agora vou te conectar a outro usuário.'
];

wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const username = urlParams.get('username');
    if (!username) {
        ws.close(1008, 'Username required');
        return;
    }
    users.set(username, { ws, autoCount: 0, pairedUser: null });

    // Envia mensagem inicial
    ws.send(JSON.stringify({ type: 'server', message: `Olá, ${username}! Bem-vindo ao chat!` }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const user = users.get(username);

            if (data.type === 'message') {
                if (user.autoCount < 5) {
                    // Resposta automática do servidor
                    ws.send(JSON.stringify({ type: 'server', message: autoResponses[user.autoCount] }));
                    user.autoCount++;
                    if (user.autoCount === 5) {
                        ws.send(JSON.stringify({ type: 'server', message: 'Aguardando outro usuário para conversar...' }));
                        pairUsers(username);
                    }
                } else if (user.pairedUser) {
                    // Envia mensagem para o usuário pareado
                    const pairedUser = users.get(user.pairedUser);
                    if (pairedUser && pairedUser.ws.readyState === WebSocket.OPEN) {
                        pairedUser.ws.send(JSON.stringify({
                            type: 'user',
                            username: username,
                            message: data.message
                        }));
                    } else {
                        ws.send(JSON.stringify({ type: 'server', message: 'O outro usuário desconectou. Aguardando novo usuário...' }));
                        user.pairedUser = null;
                        pairUsers(username);
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'server', message: 'Aguardando outro usuário para conversar...' }));
                }
            }
        } catch (error) {
            ws.send(JSON.stringify({ type: 'server', message: 'Erro ao processar mensagem: ' + error.message }));
        }
    });

    ws.on('close', () => {
        const user = users.get(username);
        if (user && user.pairedUser) {
            const pairedUser = users.get(user.pairedUser);
            if (pairedUser && pairedUser.ws.readyState === WebSocket.OPEN) {
                pairedUser.ws.send(JSON.stringify({
                    type: 'server',
                    message: `${username} saiu do chat. Aguardando novo usuário...`
                }));
                pairedUser.pairedUser = null;
                pairUsers(user.pairedUser);
            }
        }
        users.delete(username);
    });
});

// Função para parear usuários
function pairUsers(username) {
    const user = users.get(username);
    if (!user || user.pairedUser) return;

    for (const [otherUsername, otherUser] of users) {
        if (otherUsername !== username && !otherUser.pairedUser && otherUser.autoCount >= 5) {
            user.pairedUser = otherUsername;
            otherUser.pairedUser = username;
            user.ws.send(JSON.stringify({
                type: 'server',
                message: `Conectado com ${otherUsername}! Podem conversar agora.`
            }));
            otherUser.ws.send(JSON.stringify({
                type: 'server',
                message: `Conectado com ${username}! Podem conversar agora.`
            }));
            break;
        }
    }
}

// Inicia o servidor
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em: http://localhost:${port}`);
});

// Configura o WebSocket para upgrades
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
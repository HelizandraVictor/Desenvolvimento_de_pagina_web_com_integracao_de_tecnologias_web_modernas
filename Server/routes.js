
const express = require('express');
// Cria um roteador do Express para definir as rotas da API
const router = express.Router();
// Importa o módulo 'fs' para operações de leitura/escrita de arquivos
const fs = require('fs').promises;
// Importa o módulo 'moment' para manipulação de datas
const moment = require('moment');
// Importa o módulo 'path' para manipulação de caminhos de arquivos
const path = require('path');
// Define o caminho do arquivo JSON que armazena as memórias
const MEMORIES_FILE = path.join(__dirname, 'memorias.json');

// Função para ler as memórias do arquivo JSON
async function readMemories() {
    try {
        // Lê o conteúdo do arquivo JSON
        const data = await fs.readFile(MEMORIES_FILE, 'utf8');
        // Converte o conteúdo para um objeto JavaScript
        return JSON.parse(data);
    } catch (error) {
        // Se o arquivo não existir, cria um novo com um array vazio
        if (error.code === 'ENOENT') {
            await fs.writeFile(MEMORIES_FILE, JSON.stringify([]));
            return [];
        }
        // Lança outros erros
        throw error;
    }
}

// Função para escrever as memórias no arquivo JSON
async function writeMemories(memories) {
    // Escreve o array de memórias no arquivo com formatação (2 espaços de indentação)
    await fs.writeFile(MEMORIES_FILE, JSON.stringify(memories, null, 2));
}

// Rota POST para registrar uma nova memória
router.post('/memories', async (req, res) => {
    try {
        // Lê as memórias existentes
        const memories = await readMemories();
        // Cria um novo objeto de memória com os dados do corpo da requisição
        const memory = {
            _id: Date.now().toString(), // Gera um ID único baseado no timestamp
            name: req.body.name,
            age: req.body.age,
            category: req.body.category,
            description: req.body.description,
            favorite: false, // Define como não favorito por padrão
            createdAt: new Date() // Adiciona a data de criação
        };
        // Adiciona a nova memória ao array
        memories.push(memory);
        // Salva as memórias atualizadas no arquivo
        await writeMemories(memories);
        // Responde com status 201 (criado) e mensagem de sucesso
        res.status(201).json({ message: 'Memória registrada com sucesso!' });
    } catch (error) {
        // Responde com status 500 e mensagem de erro em caso de falha
        res.status(500).json({ message: 'Erro ao registrar memória: ' + error.message });
    }
});

// Rota GET para obter memórias, com suporte a filtros
router.get('/memories', async (req, res) => {
    try {
        // Lê as memórias existentes
        const memories = await readMemories();
        // Obtém os parâmetros de consulta (query parameters)
        const category = req.query.category;
        const favorite = req.query.favorite === 'true';
        // Inicializa o array de memórias filtradas
        let filteredMemories = memories;
        // Filtra por memórias favoritas, se especificado
        if (favorite) {
            filteredMemories = filteredMemories.filter(m => m.favorite);
        }
        // Filtra por categoria, se especificado e diferente de 'Todas'
        if (category && category !== 'Todas') {
            filteredMemories = filteredMemories.filter(m => m.category === category);
        }
        // Responde com as memórias filtradas
        res.json(filteredMemories);
    } catch (error) {
        // Responde com status 500 e mensagem de erro em caso de falha
        res.status(500).json({ message: 'Erro ao carregar memórias: ' + error.message });
    }
});

// Rota PATCH para alternar o status de favorito de uma memória
router.patch('/memories/:id/favorite', async (req, res) => {
    try {
        // Lê as memórias existentes
        const memories = await readMemories();
        // Encontra a memória pelo ID
        const memory = memories.find(m => m._id === req.params.id);
        if (memory) {
            // Alterna o status de favorito
            memory.favorite = !memory.favorite;
            // Salva as memórias atualizadas
            await writeMemories(memories);
            // Responde com mensagem de sucesso
            res.json({ message: 'Favorito atualizado!' });
        } else {
            // Responde com status 404 se a memória não for encontrada
            res.status(404).json({ message: 'Memória não encontrada' });
        }
    } catch (error) {
        // Responde com status 500 e mensagem de erro em caso de falha
        res.status(500).json({ message: 'Erro ao atualizar favorito: ' + error.message });
    }
});

// Rota PUT para atualizar uma memória existente
router.put('/memories/:id', async (req, res) => {
    try {
        // Lê as memórias existentes
        const memories = await readMemories();
        // Encontra a memória pelo ID
        const memory = memories.find(m => m._id === req.params.id);
        if (memory) {
            // Atualiza os campos da memória com os dados do corpo da requisição
            memory.name = req.body.name;
            memory.age = req.body.age;
            memory.category = req.body.category;
            memory.description = req.body.description;
            // Salva as memórias atualizadas
            await writeMemories(memories);
            // Responde com mensagem de sucesso
            res.json({ message: 'Memória atualizada!' });
        } else {
            // Responde com status 404 se a memória não for encontrada
            res.status(404).json({ message: 'Memória não encontrada' });
        }
    } catch (error) {
        // Responde com status 500 e mensagem de erro em caso de falha
        res.status(500).json({ message: 'Erro ao atualizar memória: ' + error.message });
    }
});

// Rota DELETE para excluir uma memória
router.delete('/memories/:id', async (req, res) => {
    try {
        // Lê as memórias existentes
        const memories = await readMemories();
        // Filtra as memórias, removendo a memória com o ID especificado
        const filteredMemories = memories.filter(m => m._id !== req.params.id);
        if (filteredMemories.length < memories.length) {
            // Salva as memórias filtradas (sem a memória excluída)
            await writeMemories(filteredMemories);
            // Responde com mensagem de sucesso
            res.json({ message: 'Memória apagada!' });
        } else {
            // Responde com status 404 se a memória não for encontrada
            res.status(404).json({ message: 'Memória não encontrada' });
        }
    } catch (error) {
        // Responde com status 500 e mensagem de erro em caso de falha
        res.status(500).json({ message: 'Erro ao apagar memória: ' + error.message });
    }
});

// Rota GET para obter relatórios de memórias
router.get('/reports', async (req, res) => {
    try {
        // Lê as memórias existentes
        const memories = await readMemories();
        // Obtém o período do relatório (padrão: 'year')
        const period = req.query.period || 'year';
        // Calcula o total de memórias
        const totalMemories = memories.length;
        // Calcula o total de memórias favoritas
        const favoriteMemories = memories.filter(m => m.favorite).length;
        // Inicializa arrays para rótulos e dados do período
        const periodLabels = [];
        const periodData = [];
        // Obtém a data atual com Moment.js
        const now = moment();
        // Gera dados para o gráfico com base no período
        if (period === 'year') {
            // Dados para os últimos 12 meses
            for (let i = 11; i >= 0; i--) {
                const date = now.clone().subtract(i, 'months');
                periodLabels.push(date.format('MMM YYYY')); // Formato: 'MMM YYYY'
                // Conta memórias criadas no mês
                periodData.push(memories.filter(m => moment(m.createdAt).isSame(date, 'month')).length);
            }
        } else if (period === 'month') {
            // Dados para os últimos 31 dias
            for (let i = 30; i >= 0; i--) {
                const date = now.clone().subtract(i, 'days');
                periodLabels.push(date.format('DD MMM')); // Formato: 'DD MMM'
                // Conta memórias criadas no dia
                periodData.push(memories.filter(m => moment(m.createdAt).isSame(date, 'day')).length);
            }
        } else {
            // Dados para os últimos 7 dias (semana)
            for (let i = 6; i >= 0; i--) {
                const date = now.clone().subtract(i, 'days');
                periodLabels.push(date.format('DD MMM')); // Formato: 'DD MMM'
                // Conta memórias criadas no dia
                periodData.push(memories.filter(m => moment(m.createdAt).isSame(date, 'day')).length);
            }
        }
        // Conta memórias favoritas por categoria
        const favoriteCategories = [
            memories.filter(m => m.favorite && m.category === 'Família').length,
            memories.filter(m => m.favorite && m.category === 'Lazer').length,
            memories.filter(m => m.favorite && m.category === 'Conquista').length,
            memories.filter(m => m.favorite && m.category === 'Viagens').length,
            memories.filter(m => m.favorite && m.category === 'Trabalho').length
        ];
        // Responde com os dados do relatório
        res.json({
            totalMemories,
            favoriteMemories,
            periodLabels,
            periodData,
            favoriteCategories
        });
    } catch (error) {
        // Responde com status 500 e mensagem de erro em caso de falha
        res.status(500).json({ message: 'Erro ao carregar relatórios: ' + error.message });
    }
});

// Exporta o roteador para uso no aplicativo Express
module.exports = router;

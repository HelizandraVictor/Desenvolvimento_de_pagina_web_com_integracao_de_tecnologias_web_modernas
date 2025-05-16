const express = require('express');
  const router = express.Router();
  const fs = require('fs').promises;
  const moment = require('moment');
  const path = require('path');
  const MEMORIES_FILE = path.join(__dirname, 'memorias.json');

  async function readMemories() {
      try {
          const data = await fs.readFile(MEMORIES_FILE, 'utf8');
          return JSON.parse(data);
      } catch (error) {
          if (error.code === 'ENOENT') {
              await fs.writeFile(MEMORIES_FILE, JSON.stringify([]));
              return [];
          }
          throw error;
      }
  }

  async function writeMemories(memories) {
      await fs.writeFile(MEMORIES_FILE, JSON.stringify(memories, null, 2));
  }

  router.post('/memories', async (req, res) => {
      try {
          const memories = await readMemories();
          const memory = {
              _id: Date.now().toString(),
              name: req.body.name,
              age: req.body.age,
              category: req.body.category,
              description: req.body.description,
              favorite: false,
              createdAt: new Date()
          };
          memories.push(memory);
          await writeMemories(memories);
          res.status(201).json({ message: 'Memória registrada com sucesso!' });
      } catch (error) {
          res.status(500).json({ message: 'Erro ao registrar memória: ' + error.message });
      }
  });

  router.get('/memories', async (req, res) => {
      try {
          const memories = await readMemories();
          const category = req.query.category;
          const favorite = req.query.favorite === 'true';
          let filteredMemories = memories;
          if (favorite) {
              filteredMemories = filteredMemories.filter(m => m.favorite);
          }
          if (category && category !== 'Todas') {
              filteredMemories = filteredMemories.filter(m => m.category === category);
          }
          res.json(filteredMemories);
      } catch (error) {
          res.status(500).json({ message: 'Erro ao carregar memórias: ' + error.message });
      }
  });

  router.patch('/memories/:id/favorite', async (req, res) => {
      try {
          const memories = await readMemories();
          const memory = memories.find(m => m._id === req.params.id);
          if (memory) {
              memory.favorite = !memory.favorite;
              await writeMemories(memories);
              res.json({ message: 'Favorito atualizado!' });
          } else {
              res.status(404).json({ message: 'Memória não encontrada' });
          }
      } catch (error) {
          res.status(500).json({ message: 'Erro ao atualizar favorito: ' + error.message });
      }
  });

  router.put('/memories/:id', async (req, res) => {
      try {
          const memories = await readMemories();
          const memory = memories.find(m => m._id === req.params.id);
          if (memory) {
              memory.name = req.body.name;
              memory.age = req.body.age;
              memory.category = req.body.category;
              memory.description = req.body.description;
              await writeMemories(memories);
              res.json({ message: 'Memória atualizada!' });
          } else {
              res.status(404).json({ message: 'Memória não encontrada' });
          }
      } catch (error) {
          res.status(500).json({ message: 'Erro ao atualizar memória: ' + error.message });
      }
  });

  router.delete('/memories/:id', async (req, res) => {
      try {
          const memories = await readMemories();
          const filteredMemories = memories.filter(m => m._id !== req.params.id);
          if (filteredMemories.length < memories.length) {
              await writeMemories(filteredMemories);
              res.json({ message: 'Memória apagada!' });
          } else {
              res.status(404).json({ message: 'Memória não encontrada' });
          }
      } catch (error) {
          res.status(500).json({ message: 'Erro ao apagar memória: ' + error.message });
      }
  });

  router.get('/reports', async (req, res) => {
      try {
          const memories = await readMemories();
          const period = req.query.period || 'year';
          const totalMemories = memories.length;
          const favoriteMemories = memories.filter(m => m.favorite).length;
          const periodLabels = [];
          const periodData = [];
          const now = moment();
          if (period === 'year') {
              for (let i = 11; i >= 0; i--) {
                  const date = now.clone().subtract(i, 'months');
                  periodLabels.push(date.format('MMM YYYY'));
                  periodData.push(memories.filter(m => moment(m.createdAt).isSame(date, 'month')).length);
              }
          } else if (period === 'month') {
              for (let i = 30; i >= 0; i--) {
                  const date = now.clone().subtract(i, 'days');
                  periodLabels.push(date.format('DD MMM'));
                  periodData.push(memories.filter(m => moment(m.createdAt).isSame(date, 'day')).length);
              }
          } else {
              for (let i = 6; i >= 0; i--) {
                  const date = now.clone().subtract(i, 'days');
                  periodLabels.push(date.format('DD MMM'));
                  periodData.push(memories.filter(m => moment(m.createdAt).isSame(date, 'day')).length);
              }
          }
          const favoriteCategories = [
              memories.filter(m => m.favorite && m.category === 'Família').length,
              memories.filter(m => m.favorite && m.category === 'Lazer').length,
              memories.filter(m => m.favorite && m.category === 'Conquista').length,
              memories.filter(m => m.favorite && m.category === 'Viagens').length,
              memories.filter(m => m.favorite && m.category === 'Trabalho').length
          ];
          res.json({
              totalMemories,
              favoriteMemories,
              periodLabels,
              periodData,
              favoriteCategories
          });
      } catch (error) {
          res.status(500).json({ message: 'Erro ao carregar relatórios: ' + error.message });
      }
  });

  module.exports = router;
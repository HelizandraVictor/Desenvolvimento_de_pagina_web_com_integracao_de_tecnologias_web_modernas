Projeto Web Multitemático
Este projeto é uma aplicação web desenvolvida para o Trabalho01_Individual da disciplina de Programação Web. A aplicação permite que usuários registrem, organizem, e compartilhem memórias pessoais, com funcionalidades de favoritagem, chat em tempo real, relatórios estatísticos, e uma página informativa. O projeto utiliza tecnologias modernas como Node.js, Express, WebSocket, Bootstrap, e Chart.js, com persistência de dados em um arquivo JSON.
Funcionalidades

Registro de Memórias: Crie, edite, e exclua memórias com nome, idade, categoria (Família, Lazer, Conquista, Viagens, Trabalho), e descrição.
Memórias Favoritas: Liste e gerencie memórias marcadas como favoritas.
Chat em Tempo Real: Converse com outros usuários via WebSocket, com 5 mensagens automáticas iniciais.
Relatórios: Visualize estatísticas (total de memórias, favoritas) e gráficos (memórias por período, favoritas por categoria).
Sobre: Página estática com informações sobre o projeto.
Interface Responsiva: Design moderno e adaptável a diferentes dispositivos, com modais e alertas personalizados.

Tecnologias Utilizadas

Frontend: HTML, CSS (Bootstrap 5.3), JavaScript, Chart.js
Backend: Node.js, Express, WebSocket (ws)
Persistência: Arquivo JSON (memorias.json)
Dependências: express, ws, moment
Hospedagem: Render (plano gratuito)

Estrutura do Projeto
projeto-pagina-web/
├── public/
│   ├── index.html         # Página principal (registro e listagem de memórias)
│   ├── favoritos.html     # Lista memórias favoritas
│   ├── chat.html          # Chat em tempo real
│   ├── painel.html        # Relatórios e gráficos
│   ├── sobre.html         # Página sobre o projeto
│   ├── estilo.css         # Estilos personalizados
├── server/
│   ├── app.js             # Servidor Express e WebSocket
│   ├── routes.js          # Rotas da API (CRUD e relatórios)
│   ├── memorias.json      # Banco de dados JSON
├── .gitignore             # Arquivos ignorados pelo Git
├── package.json           # Dependências e scripts
├── README.md              # Documentação

Pré-requisitos

Node.js: Versão 14 ou superior (https://nodejs.org)
Navegador: Chrome, Firefox, ou outro navegador moderno
Git: Para clonar o repositório (opcional)

Instalação

Clone o repositório (ou crie a estrutura manualmente):git clone <URL-do-repositório>
cd projeto-pagina-web


Instale as dependências:npm install


Inicie o servidor:npm start


Acesse o projeto em http://localhost:3000.

Uso

Início (index.html):
Registre memórias preenchendo o formulário.
Filtre por categoria (Família, Lazer, etc.).
Favorite, edite (via modal), ou exclua memórias.


Favoritos (favoritos.html):
Visualize memórias favoritadas.
Desfavorite, edite, ou exclua.


Chat (chat.html):
Digite um nome para entrar.
Receba 5 mensagens automáticas.
Converse com outros usuários (teste com duas abas).


Relatórios (painel.html):
Veja estatísticas e gráficos.
Filtre por período (ano, mês, semana).


Sobre (sobre.html):
Leia informações sobre o projeto.



Testes Locais

Inicie o servidor (npm start).
Acesse http://localhost:3000/index.html no navegador.
Teste todas as funcionalidades:
Registre uma memória e verifique o alerta personalizado.
Favorite uma memória e confirme em favoritos.html.
Entre no chat, envie mensagens, e teste com outra aba.
Verifique gráficos em painel.html.
Confirme responsividade reduzindo a janela do navegador.


Solucione erros:
Porta ocupada: Altere a porta em server/app.js ou libere a porta 3000.
Dependências: Execute npm install se houver erros de módulos.
WebSocket: Confirme que chat.html usa ws://localhost:3000/ws.



Hospedagem no Render

Envie o projeto para um repositório GitHub:git init
git add .
git commit -m "Projeto final"
git branch -M main
git remote add origin <URL-do-repositório>
git push -u origin main


Crie um Web Service em render.com:
Conecte o repositório GitHub.
Configure:
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free


Habilite Auto-Deploy.


Acesse a URL fornecida (ex.: https://projeto-pagina-web.onrender.com).
Nota: No plano gratuito, memorias.json é reiniciado em cada deploy. Considere um banco de dados para persistência.

Problemas Comuns

Erro: "Cannot find module 'express'":
Execute npm install.


Erro: "Port 3000 is already in use":
Libere a porta:netstat -aon | findstr :3000
taskkill /PID <PID> /F




WebSocket não conecta:
Verifique o console do navegador (F12 > Console).
Confirme ws:// localmente ou wss:// no Render.


Memórias não persistem:
Verifique permissões de escrita em memorias.json.


Dica: Teste localmente antes do deploy para garantir funcionalidade.

Autor
Desenvolvido por Helizandra Victor Veda, estudante de [Curso/Instituição].
Licença
Este projeto é para fins educacionais e não possui licença privada.

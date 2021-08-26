const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: 'User não encontrado' })
  }

  request.user = user;

  return next();
};

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if(userExists) {
    return response.status(400).json({ error: 'Username já existente' })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const tarefa = user.todos.find(tarefa => tarefa.id === id);

  if (!tarefa) {
    return response.status(404).json({ error: 'Tarefa não encontrada' });
  };

  tarefa.title = title;
  tarefa.deadline = new Date(deadline);

  return response.status(200).json(tarefa);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const tarefa = user.todos.find(tarefa => tarefa.id === id);

  if(!tarefa) {
    return response.status(404).json({ error: 'Tarefa não encontrada' })
  }

  tarefa.done = true;

  return response.json(tarefa)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const tarefaIndex = user.todos.findIndex(tarefa => tarefa.id === id);

  if(tarefaIndex === -1) {
    return response.status(404).json({ error: 'Tarefa não encontrada' })
  }

  user.todos.splice(tarefaIndex, 1)

  return response.status(204).send();
});

module.exports = app;
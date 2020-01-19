const { Router } = require('express');
const DevController = require('./controllers/DevController');
const SearchController = require('./controllers/SearchController');

const routes = Router();

// Métodos HTTP: GET, POST, PUT E DELETE

// Tipos de Parâmetros:

// Query Params: req.query (Filtros, ordenação, paginação, ...)
// Route Params: req.params (Identificar um recurso na alteração/remoção)
// Body: req.body (Dados para criação ou alteração de um registro)

// MongoDB (não-relacional)

routes.get('/devs', DevController.index);
routes.post('/devs', DevController.store);
routes.put('/devs/:user', DevController.update);
routes.delete('/devs/:user', DevController.destroy);

routes.get('/search', SearchController.index);

module.exports = routes;
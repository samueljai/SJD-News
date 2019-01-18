const apiRoute = require('express').Router();
const topicsRoute = require('./topicsRoute');
const articlesRoute = require('./articlesRoute');
const usersRoute = require('./usersRoute');
const { getApis } = require('../controllers/apiCon');

apiRoute.get('/', getApis);
apiRoute.use('/topics', topicsRoute);
apiRoute.use('/articles', articlesRoute);
apiRoute.use('/users', usersRoute);

module.exports = apiRoute;

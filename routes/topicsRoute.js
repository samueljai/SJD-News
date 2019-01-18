const topicsRoute = require('express').Router();
const {
  getTopics,
  addTopic,
  getArticlesByTopic,
  addArticleByTopic,
} = require('../controllers/topicsCon');
const { handle405 } = require('../errors');

topicsRoute.route('/')
  .get(getTopics)
  .post(addTopic)
  .all(handle405);

topicsRoute.route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(addArticleByTopic)
  .all(handle405);

module.exports = topicsRoute;

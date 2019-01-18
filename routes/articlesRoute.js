const articlesRoute = require('express').Router();
const {
  getArticles,
  getArticleByArticleId,
  updateArticleVotesbyArticleID,
  deleteArticleByArticleId,
  getCommentsByArticleId,
  addCommentByArticleId,
  updateCommentVotesByCommentID,
  deleteCommentByCommentId,
} = require('../controllers/articlesCon');
const { handle405 } = require('../errors');

articlesRoute.route('/')
  .get(getArticles)
  .all(handle405);

articlesRoute.route('/:article_id')
  .get(getArticleByArticleId)
  .patch(updateArticleVotesbyArticleID)
  .delete(deleteArticleByArticleId)
  .all(handle405);

articlesRoute.route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(addCommentByArticleId)
  .all(handle405);

articlesRoute.route('/:article_id/comments/:comment_id')
  .patch(updateCommentVotesByCommentID)
  .delete(deleteCommentByCommentId)
  .all(handle405);

module.exports = articlesRoute;

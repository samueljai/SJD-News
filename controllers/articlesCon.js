const connection = require('../db/connection');

exports.getArticles = (req, res, next) => {
  const {
    limit = 10,
    sort_by = 'created_at',
    p = 1,
    sort_ascending = 'false',
  } = req.query;

  if (isNaN(Number(limit)) || isNaN(Number(p))) {
    return res.status(400).send({ msg: 'invalid query type' });
  }

  let order = 'desc';
  if (sort_ascending === 'true') order = 'asc';

  connection
    .select('articles_table.username AS author',
      'articles_table.title',
      'articles_table.article_id',
      'articles_table.votes',
      'articles_table.created_at',
      'articles_table.topic')
    .count('comments_table.comment_id AS comment_count')
    .from('articles_table')
    .limit(limit)
    .offset((limit * p) - limit)
    .orderBy(sort_by, order)
    .leftJoin('comments_table', 'comments_table.article_id', '=', 'articles_table.article_id')
    .groupBy('articles_table.article_id')
    .then((articles) => {
      if (!articles.length) return Promise.reject({ status: 404, msg: 'topic not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  connection
    .select('articles_table.username AS author',
      'articles_table.title',
      'articles_table.article_id',
      'articles_table.body',
      'articles_table.votes',
      'articles_table.created_at',
      'articles_table.topic')
    .count('comments_table.comment_id AS comment_count')
    .from('articles_table')
    .leftJoin('comments_table', 'comments_table.article_id', '=', 'articles_table.article_id')
    .where('articles_table.article_id', Number(article_id))
    .groupBy('articles_table.article_id')
    .then(([article]) => {
      if (!article) return Promise.reject({ status: 404, msg: 'article not found' });
      return res.status(200).send({ article });
    })
    .catch(next);
};

exports.updateArticleVotesbyArticleID = (req, res, next) => {
  const { article_id } = req.params;
  let votes = req.body.inc_votes;

  if (votes === undefined) votes = 0;

  if (typeof votes !== 'number') {
    return res.status(400).send({ msg: 'invalid data input' });
  }

  connection('articles_table')
    .where({ article_id })
    .increment('votes', votes)
    .returning('*')
    .then((article) => {
      if (!article.length) return Promise.reject({ status: 404, msg: 'article not found' });
      return res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  connection('articles_table')
    .where({ article_id })
    .del()
    .returning('*')
    .then((article) => {
      if (!article.length) return Promise.reject({ status: 404, msg: 'article not found' });
      return res.status(204).send();
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const {
    limit = 10,
    sort_by = 'created_at',
    p = 1,
    sort_ascending = 'false',
  } = req.query;

  let order = 'desc';
  if (sort_ascending === 'true') order = 'asc';

  connection
    .select('comments_table.username AS author',
      'comments_table.comment_id',
      'comments_table.body',
      'comments_table.votes',
      'comments_table.created_at')
    .from('comments_table')
    .limit(limit)
    .offset((limit * p) - limit)
    .orderBy(sort_by, order)
    .where('article_id', Number(article_id))
    .then((comments) => {
      if (comments.length === 0) {
        return res.status(404).send({});
      }
      return res.status(200).send({ comments });
    })
    .catch(next);
};

exports.addCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { body, username } = req.body;

  if ((typeof body !== 'string') || (typeof username !== 'string')) {
    return res.status(400).send({ msg: 'invalid data entry' });
  }

  if ((body.trim().length === 0) || (username.trim().length === 0)) {
    return res.status(400).send({ msg: 'invalid data entry' });
  }

  const submittedComment = {
    body,
    username,
    article_id,
  };

  connection('comments_table')
    .insert(submittedComment)
    .returning('*')
    .then(([comment]) => {
      if (!comment) return Promise.reject({ status: 422, msg: 'username not found' });
      return res.status(201).send({ comment });
    })
    .catch(next);
};

exports.updateCommentVotesByCommentID = (req, res, next) => {
  const { comment_id, article_id } = req.params;
  let votes = req.body.inc_votes;

  if (votes === undefined) votes = 0;

  if (typeof votes !== 'number') {
    return res.status(400).send({ msg: 'invalid data input' });
  }


  connection('comments_table')
    .where({ comment_id })
    .andWhere({ article_id })
    .increment('votes', votes)
    .returning('*')
    .then((comment) => {
      if (!comment.length) return Promise.reject({ status: 400 });
      return res.status(200).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentByCommentId = (req, res, next) => {
  const { comment_id, article_id } = req.params;

  connection('comments_table')
    .where({ comment_id })
    .andWhere({ article_id })
    .del()
    .returning('*')
    .then((comment) => {
      if (!comment.length) return Promise.reject({ status: 404, msg: 'comment not found' });
      return res.status(204).send();
    })
    .catch(next);
};

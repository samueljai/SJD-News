const connection = require('../db/connection');

exports.getTopics = (req, res, next) => {
  connection
    .select('*')
    .from('topics_table')
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};


exports.addTopic = (req, res, next) => {
  const { slug, description } = req.body;

  if ((typeof slug !== 'string') || (typeof description !== 'string')) {
    res.status(400).send({ msg: 'invalid data entry' });
  }

  if ((slug.trim().length === 0) || (description.trim().length === 0)) {
    res.status(400).send({ msg: 'invalid data entry' });
  }

  connection('topics_table')
    .insert(req.body)
    .returning('*')
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
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
    .where({ topic })
    .leftJoin('comments_table', 'comments_table.article_id', '=', 'articles_table.article_id')
    .groupBy('articles_table.article_id')
    .then((articles) => {
      if (!articles.length) return Promise.reject({ status: 404, msg: 'topic not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};

exports.addArticleByTopic = (req, res, next) => {
  const { topic } = req.params;
  const { title, body, username } = req.body;

  if ((typeof title !== 'string') || (typeof body !== 'string') || (typeof username !== 'string')) {
    res.status(400).send({ msg: 'invalid data entry' });
  }

  if ((title.trim().length === 0) || (body.trim().length === 0) || (username.trim().length === 0)) {
    res.status(400).send({ msg: 'invalid data entry' });
  }

  const submittedArticle = {
    title,
    body,
    username,
    topic,
  };

  connection('articles_table')
    .insert(submittedArticle)
    .returning('*')
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

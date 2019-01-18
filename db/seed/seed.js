const {
  topicData, userData,
} = require('../data');
const { formatArticlesData, formatCommentsData } = require('../utils');

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('topics_table')
    .del()
    .then(() => knex('topics_table').insert(topicData))
    .then(() => knex('users_table').insert(userData))
    .then(() => {
      const updatedArticleData = formatArticlesData();
      return knex('articles_table').returning(['article_id', 'title']).insert(updatedArticleData);
    })
    .then((articles_table) => {
      const updatedCommentsData = formatCommentsData(articles_table);
      return knex('comments_table').insert(updatedCommentsData);
    });
};

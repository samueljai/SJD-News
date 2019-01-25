const {
  articleData, commentData,
} = require('../data');

exports.formatArticlesData = function () {
  return articleData.map(({ created_at, created_by, ...remainingArticleData }) => {
    const newDate = new Date(created_at);
    return ({ created_at: newDate, username: created_by, ...remainingArticleData });
  });
};

exports.formatCommentsData = function (articles_table) {
  // loop through each comment
  // get the belongs_to value
  // use that to search the articles table title field
  // find the match, and then return it's article ID

  return commentData.map(({
    belongs_to,
    created_by,
    created_at,
    ...remainingCommentsData
  }) => {
    const newDate = new Date(created_at);
    const matchedArticle = articles_table.filter(article => {
      console.log("article ", article, "...belongs to: ", belongs_to)
      return (article.title === belongs_to)
    });
    console.log("matched article: ", matchedArticle)
    return ({
      article_id: matchedArticle[0].article_id,
      created_at: newDate,
      username: created_by,
      ...remainingCommentsData,
    });
  });
};

// exports.checkTopics = function (newTopic) {
//   return topicData.some(topic => topic.slug === newTopic);
// };

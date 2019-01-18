
exports.up = function (knex, Promise) {
  return knex.schema.createTable('articles_table', (articlesTable) => {
    articlesTable.increments('article_id').primary();
    articlesTable.unique('article_id');
    articlesTable.string('title');
    articlesTable.text('body');
    articlesTable.integer('votes').defaultTo(0);
    articlesTable.string('topic').references('topics_table.slug');
    articlesTable.string('username').references('users_table.username');
    articlesTable.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('articles_table');
};

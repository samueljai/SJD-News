
exports.up = function (knex, Promise) {
  return knex.schema.createTable('comments_table', (commentsTable) => {
    commentsTable.increments('comment_id').primary();
    commentsTable.unique('comment_id');
    commentsTable.string('username').references('users_table.username');
    commentsTable.integer('article_id').references('articles_table.article_id').onDelete('CASCADE');
    commentsTable.integer('votes').defaultTo(0);
    commentsTable.timestamp('created_at').defaultTo(knex.fn.now());
    commentsTable.text('body');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comments_table');
};

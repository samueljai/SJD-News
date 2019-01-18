
exports.up = function (knex, Promise) {
  return knex.schema.createTable('users_table', (usersTable) => {
    usersTable.string('username').primary();
    usersTable.unique('username');
    usersTable.string('avatar_url');
    usersTable.string('name');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users_table');
};

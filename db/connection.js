const ENV = process.env.NODE_ENV || 'development';
console.log(ENV, 'node environment')
const config = ENV === 'production' ? { client: 'pg', connection: process.env.DATABASE_URL } : require('../knexfile')[ENV];

module.exports = require('knex')(config);
const usersRoute = require('express').Router();
const { getUsers, addUser, getUserByUsername } = require('../controllers/usersCon');
const { handle405 } = require('../errors');

usersRoute.route('/')
  .get(getUsers)
  .post(addUser)
  .all(handle405);

usersRoute.route('/:username')
  .get(getUserByUsername)
  .all(handle405);

module.exports = usersRoute;

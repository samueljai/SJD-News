const connection = require('../db/connection');

exports.getUsers = (req, res, next) => {
  connection
    .select('*')
    .from('users_table')
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.addUser = (req, res, next) => {
  connection('users_table')
    .insert(req.body)
    .returning('*')
    .then(([user]) => {
      res.status(201).send({ user });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  connection.select('*')
    .from('users_table')
    .where({ username })
    .then(([user]) => {
      if (!user) return Promise.reject({ status: 404, msg: 'user not found' });
      return res.status(200).send({ user });
    })
    .catch(next);
};

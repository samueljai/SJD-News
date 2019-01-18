exports.handle400 = (err, req, res, next) => {
  const codes = {
    '22P02': 'invalid input syntax for integer',
    // eslint-disable-next-line quote-props
    '42703': 'column does not exist in the table',
  };

  if ((err.status === 400) || (codes[err.code])) {
    return res.status(400).send({ msg: codes[err.code] });
  }
  next(err);
};

exports.handle404 = (err, req, res, next) => {
  if ((err.status === 404) || (err.detail.includes('is not present in table'))) {
    return res.status(404).send({ msg: err.msg });
    // if not, then move to the next error handler in the chain
  }
  next(err);
};

exports.handle422 = (err, req, res, next) => {

  console.log(err)
  const codes = {
    // eslint-disable-next-line quote-props
    '23503': 'does not exist',
    // eslint-disable-next-line quote-props
    '23505': 'new entry already exists',
  };

  if (codes[err.code]) res.status(422).send({ msg: codes[err.code] });
  // if error has status 404, then respond
  else if (err.status === 422) res.status(422).send({ msg: err.msg });
  // if not, then move to the next error handler in the chain
  else next(err);
};

exports.handle405 = (req, res, next) => {
  // this function is called in the .all() in the router
  res.status(405).send({ msg: 'method not allowed' });
};

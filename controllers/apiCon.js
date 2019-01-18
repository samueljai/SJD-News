const endpointsFile = require('../routes/endpoints.json');

exports.getApis = (req, res, next) => {
  res.send(endpointsFile);
  next();
};

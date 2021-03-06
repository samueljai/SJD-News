const cors = require('cors');
const app = require('express')();
const bodyParser = require('body-parser');
const apiRoute = require('./routes/apiRoute');
const { handle404, handle400, handle422 } = require('./errors');

app.use(bodyParser.json());
app.use(cors());
app.use('/api', apiRoute);

app.use(handle400);
app.use(handle404);
app.use(handle422);

// app.use('*', () => {

// });

module.exports = app;

const express = require('express');
const cors = require('cors');
const vehiclesRouter = require('./routes/vehicles');
const evaluationsRouter = require('./routes/evaluations');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/evaluations', evaluationsRouter);

module.exports = app;

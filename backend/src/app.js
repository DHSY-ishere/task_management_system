const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { corsOrigins } = require('./config/env');
const taskRoutes = require('./routes/task.routes');
const openApiSpec = require('./docs/openapi');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.status(200).json({ success: true, status: 'ok' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api/tasks', taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

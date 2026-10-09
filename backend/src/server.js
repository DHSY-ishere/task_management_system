const app = require('./app');
const { port, seedData, nodeEnv } = require('./config/env');
const taskService = require('./services/task.service');

if (seedData) taskService.seed();

app.listen(port, () => {
  console.log(`[${nodeEnv}] Task API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
});

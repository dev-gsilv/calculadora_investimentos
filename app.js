import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// DB CONNECTION
import conn from './backend/db/mongo.js';

// Routes
import routes from './backend/routes/router.js';

const app = express();

app.use(express.json());
conn();
app.listen(process.env.API_PORT);
routes(app);

const swaggerDoc = YAML.load('swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

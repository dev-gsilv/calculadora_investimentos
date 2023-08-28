import healthRoutes from './health.js';
import investRoutes from './investimento.js';
import loginRoutes from './login.js';
import userRoutes from './usuario.js';

const routes = (app) => {
    healthRoutes(app);
    loginRoutes(app);
    investRoutes(app);
    userRoutes(app);
};

export default routes;

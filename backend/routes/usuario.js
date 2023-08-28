import {
    create,
    getOne,
    getAll,
    update,
    remove,
    removeWhere,
} from '../controllers/usuarioController.js';
import { checkToken } from '../utils/validacoes.js';
import { permissionMiddleware } from '../auth/rbac.js';

const userRoutes = (app) => {
    app.post('/usuario/registro', create);
    app.get('/usuario/:id', checkToken, permissionMiddleware, getOne);
    app.get('/usuario/', checkToken, permissionMiddleware, getAll);
    app.put('/usuario/:id', checkToken, permissionMiddleware, update);
    app.delete('/usuario/:id', checkToken, permissionMiddleware, remove);
    app.delete('/usuario/', checkToken, permissionMiddleware, removeWhere);
};

export default userRoutes;

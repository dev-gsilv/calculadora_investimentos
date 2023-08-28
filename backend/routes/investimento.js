import {
  create,
  getOne,
  getWhere,
  getAll,
  remove,
  removeWhere,
} from "../controllers/investimentoController.js";
import { checkToken } from "../utils/validacoes.js";
import { permissionMiddleware } from "../auth/rbac.js";

const investRoutes = (app) => {
  app.post("/investimento", checkToken, create);
  app.get("/investimento/:id", checkToken, permissionMiddleware, getOne);
  app.get("/busca/investimento/", checkToken, permissionMiddleware, getWhere);
  app.get("/investimento/", checkToken, permissionMiddleware, getAll);
  app.delete("/investimento/:id", checkToken, permissionMiddleware, remove);
  app.delete("/investimento", checkToken, permissionMiddleware, removeWhere);
};

export default investRoutes;

import { login } from "../controllers/loginController.js";

const loginRoutes = (app) => {
  app.get("/auth/login", login);
};

export default loginRoutes;

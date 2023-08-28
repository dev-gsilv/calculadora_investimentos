import { check } from "../controllers/healthController.js";

const healthRoutes = (app) => {
  app.get("/health", check);
};

export default healthRoutes;

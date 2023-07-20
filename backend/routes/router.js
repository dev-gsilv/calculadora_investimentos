import healthRoutes from './health.js'
import investRoutes from './investimento.js'

const routes = app => {
    healthRoutes(app)
    investRoutes(app)
}

export default routes
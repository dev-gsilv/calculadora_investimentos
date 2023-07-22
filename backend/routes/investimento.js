import { create, getOne, getWhere, getAll, remove, removeWhere } from '../controllers/investimentoController.js'
import { checkToken } from '../utils/validacoes.js'

const investRoutes = (app) => {
    app.post('/investimento', checkToken, create)
    app.get('/investimento/:id', checkToken, getOne)
    app.get('/private/investimento/', checkToken, getWhere)
    app.get('/private/investimento/', checkToken, getAll)
    app.delete('/investimento/:id', checkToken, remove)
    app.delete('/private/investimento', checkToken, removeWhere)
}

export default investRoutes
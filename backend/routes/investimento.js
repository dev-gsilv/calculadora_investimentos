import { login } from '../controllers/login.js'
import { create, getOne, getAll, remove, removeWhere } from '../controllers/investimentoController.js'


const investRoutes = (app) => {
    app.get('/', login)
    app.post('/investimento', create)
    app.get('/investimento/:id', getOne)
    app.get('/investimento/', getAll)
    app.delete('/investimento/:id', remove)
    app.delete('/investimento', removeWhere)
}

export default investRoutes
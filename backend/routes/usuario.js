import { getOne, getAll, update, remove, removeWhere  } from '../controllers/usuarioController.js'
import { checkToken } from '../utils/validacoes.js'

const userRoutes = (app) => {
    app.get('/usuario/:id', /*checkToken*/ getOne)
    app.get('/usuario/', /*checkToken*/ getAll)
    app.put('/usuario/:id', /*checkToken*/ update)
    app.delete('/usuario/:id', /*checkToken*/ remove)
    app.delete('/usuario/', /*checkToken*/ removeWhere)
}

export default userRoutes
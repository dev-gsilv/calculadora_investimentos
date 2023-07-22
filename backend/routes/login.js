import { login } from '../controllers/loginController.js'
import { create } from '../controllers/usuarioController.js'

const loginRoutes = (app) => {
    app.post('/auth/login', login)
    app.post('/auth/registro', create)
}

export default loginRoutes
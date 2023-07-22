import Usuario from '../models/Usuario.js'
import { validarLogin } from '../utils/validacoes.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const login2 = async (req, res) => {
    return res.status(403).json({msg: 'Login TBD'})
}

export const login = async (req,res) => {
    const { email, senha } = req.body

    const usuarioLogin = {email, senha}
    const erro = await validarLogin(usuarioLogin)
    if(erro){
        return res.status(422).json({msg: erro})
    }

    try {
        const secret = process.env.SECRET
        const usuario = await Usuario.findOne({ email:usuarioLogin.email })
        const token = jwt.sign(
            {
                id: usuario._id,
            },
            secret
        )

        res.status(200).json({ msg: 'Usuário autenticado com sucesso!', token })
        
    } catch (e) {
        console.error(e)
        res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
    }
}
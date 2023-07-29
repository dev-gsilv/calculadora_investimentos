import bcrypt from 'bcrypt'
import { validarNovoUsuario, validarUsuario, validarSenha } from '../utils/validacoes.js'
import Usuario from '../models/Usuario.js'
import objToConsole from '../utils/objPrint.js'

export const create = async (req, res) => {
    try {
        const {nome, email, senha} = req.body

        const novoUsuario = {nome, email, senha}
        const erro = await validarNovoUsuario(novoUsuario)
        if(erro){
            return res.status(422).json({msg: erro})
        }

        const salt = await bcrypt.genSalt(12)
        const senhaHash = await bcrypt.hash(senha, salt)

        const usuarioValidado = new Usuario({
            nome,
            email,
            senha: senhaHash,
        })

        try {
            await usuarioValidado.save()
            res.status(201).json({msg: `Bem-vindo ao Simulfix, ${usuarioValidado.nome}!`})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}

export const getOne =  async (req, res) => {
    try {
        const id = req.params.id

        const usuario = await validarUsuario(await Usuario.findById(id, "-senha"))
    
        return res.status(usuario.httpCode).json({ msg: usuario.msg })
    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}

export const getAll = async (req, res) => {
    try {
        const usuarios = await validarUsuario(await Usuario.find({}, "-senha"))

        return res.status(usuarios.httpCode).json({ 
            Total: usuarios.msg.length, 
            Usuarios: usuarios.msg 
        })  
    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})        
    }
}

export const update = async (req, res) => {
    try {
        const {nome, senhaAntiga, senhaNova} = req.body
        const id = req.params.id

        const usuarioCheck = await validarUsuario(await Usuario.findById(id))

        if(usuarioCheck.httpCode === 404){
            return res.status(usuarioCheck.httpCode).json({ msg: usuarioCheck.msg }) 
        }

        const usuario = usuarioCheck.msg
        
        if(senhaAntiga && senhaNova) {
            const senhaValida = await validarSenha(senhaAntiga, usuario.senha)
            if(!senhaValida){
                return res.status(422).json({ msg: 'Senha incorreta!' })
            }

            const salt = await bcrypt.genSalt(12)
            const senhaHash = await bcrypt.hash(senhaNova, salt)
            usuario.senha = senhaHash
        }
        
        if(nome){
            usuario.nome = nome
        }     

        try {
            await usuario.save()
            res.status(200).json({msg: 'Usuário atualizado!'})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}

export const remove = async (req, res) => {
    try {
        const id = req.params.id

        const usuarioCheck = await validarUsuario(await Usuario.findById(id))

        if(usuarioCheck.httpCode == 404){
            return res.status(usuarioCheck.httpCode).json({ msg: usuarioCheck.msg }) 
        }

        const usuario = usuarioCheck.msg

        try {
            const query = await usuario.deleteOne({id: id})
            res.status(200).json({msg: 'Usuario removido!', Usuario_ID: query._id})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}

export const removeWhere = async (req, res) => {
    try {
        const condition = req.body.condition

        try {
            const query = await Usuario.deleteMany(condition)
            res.status(200).json({'Usuários removidos: ': query.deletedCount})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}
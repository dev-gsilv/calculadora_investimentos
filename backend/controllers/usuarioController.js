import bcrypt from 'bcrypt'
import { validarNovoUsuario, validarUsuario, validarSenha } from '../utils/validacoes.js'
import Usuario from '../models/Usuario.js'
import { objToConsole } from '../utils/objPrint.js'

export const create = async (req, res) => {
    try {
        const {nome, email, senha, confirmarSenha} = req.body

        const novoUsuario = {nome, email, senha, confirmarSenha}
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

        // DEBUG
        objToConsole(usuarioValidado._doc)

        try {
            await usuarioValidado.save()
            res.status(201).json({msg: 'Usuário criado!', usuarioValidado})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Server error. Please, try again!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Invalid request. Please, try again!'})
    }
}

export const getOne =  async (req, res) => {
    const id = req.params.id

    const usuario = await validarUsuario(await Usuario.findById(id, "-senha"))

    return res.status(usuario.htmlStatus).json({ msg: usuario.msg })
}

export const getAll = async (req, res) => {
    const usuarios = await validarUsuario(await Usuario.find({}, "-senha"))

    return res.status(usuarios.htmlStatus).json({ 
        Total: usuarios.msg.length, 
        Usuarios: usuarios.msg 
    })    
}

export const update = async (req, res) => {
    try {
        const {nome, senhaAntiga, senhaNova} = req.body
        const id = req.params.id

        const usuarioCheck = await validarUsuario(await Usuario.findById(id))

        if(usuarioCheck.htmlStatus === 404){
            return res.status(usuarioCheck.htmlStatus).json({ msg: usuarioCheck.msg }) 
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
            res.status(500).json({msg: 'Server error. Please, try again!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Invalid request. Please, try again!'})
    }
}

export const remove = async (req, res) => {
    try {
        const id = req.params.id

        const usuarioCheck = await validarUsuario(await Usuario.findById(id))

        if(usuarioCheck.htmlStatus == 404){
            return res.status(usuarioCheck.htmlStatus).json({ msg: usuarioCheck.msg }) 
        }

        const usuario = usuarioCheck.msg

        try {
            const query = await usuario.deleteOne({id: id})
            res.status(200).json({msg: 'Usuario removido!', Usuario_ID: query._id})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Server error. Please, try again!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Invalid request. Please, try again!'})
    }
}

export const removeWhere = async (req, res) => {
    try {
        const condition = req.body.condition

        try {
            const query = await Usuario.deleteMany(condition)
            res.status(200).json({'Documents deleted ': query.deletedCount})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Server error. Please, try again!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Invalid request. Please, try again!'})
    }
}
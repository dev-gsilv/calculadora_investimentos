import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

const resposta = { htmlStatus: NaN, msg: ''}

export const validarDados = (invest) => {
    if(!invest.nome){
        return 'O campo nome é inválido!'    
    }
    if(!invest.tipoInvest){
        return 'O campo tipo de investimento é inválido!'    
    }
    if(!invest.indexador){
        return 'O campo indexador é inválido!'    
    }
    if((!invest.valorInvestido) || (Number(invest.valorInvestido) < 1)){
        return 'O campo valor investido é inválido!'    
    }
    if((!invest.prazoMeses) || (Number(invest.prazoMeses) < 1)){
        return 'O campo prazo é inválido!'    
    }
    if((!invest.rentabilidadeAnual) || (Number(invest.rentabilidadeAnual) < 1)){
        return 'O campo rentabilidade é inválido!'    
    }
}

export const objExist = (queryRes) => {
    const callBack = Object.create(resposta)

    if(queryRes === undefined || queryRes === null || queryRes.length == 0){
        callBack.htmlStatus = 404
        callBack.msg = 'Oh não! O que você procura parece que não existe, verifique os parâmetros de busca.'
        return callBack
    } else {
        callBack.htmlStatus = 200
        callBack.msg = queryRes
        return callBack
    }
}

// CHECAR POR FN NÃO USADAS DEPOIS DE FINALIZAR USUARIO E LOGIN
export async function validarSenha(senhaForm, senhaHash) {
    return await bcrypt.compare(senhaForm, senhaHash)
}

export async function validarNovoUsuario(dadosForm) {
    // Null fields
    if(!dadosForm.nome){
        return 'You must provide a valid nome!'    
    }

    const re = /^[a-z0-9.!#$%&'*+\-/=?^_`{|]+@[a-z0-9-]+\.[a-z]+(?:\.[a-z]+)*$/gi
    const reCheck = dadosForm.email.match(re)
    if(!dadosForm.email || reCheck === null ){
        return 'You must provide a valid email!'    
    }

    if(!dadosForm.senha || dadosForm.senha.length < 8){
        return 'You must provide a valid senha!'    
    }

    // Password confirmation
    if(dadosForm.senha !== dadosForm.confirmarSenha){
        return 'Password confirmation does not match!'
    }

    // Duplicated user
    const usuarioExiste = await Usuario.findOne({ email: dadosForm.email })
    if(usuarioExiste){
        return 'Email already registered!'
    }
}

export async function validarLogin(dadosForm) {
    if(!dadosForm.email ){
        return 'You must provide a valid email!'    
    }
    if(!dadosForm.senha){
        return 'You must provide a valid senha!'    
    }
    const usuarioBD = await Usuario.findOne({ email: dadosForm.email })
    if(!usuarioBD){
        return 'Invalid email or senha!'
    }
    const result = await validarSenha(dadosForm.senha, usuarioBD.senha)
    if( !result ){
        return 'Invalid email or senha!'
    }
}

export async function validarUsuario(queryRes) {
    const callBack = Object.create(resposta)

    if(queryRes === undefined || queryRes === null || queryRes.length == 0){
        callBack.htmlStatus = 404
        callBack.msg = 'Nenhum usuário encontrado!'
        return callBack
    } else {
        callBack.htmlStatus = 200
        callBack.msg = queryRes
        return callBack
    }
}

export function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
  
    if (!token) return res.status(401).json({ msg: "Access denied!" })
  
    try {
      const secret = process.env.SECRET
  
      jwt.verify(token, secret)
  
      next();
    } catch (err) {
      res.status(400).json({ msg: "Invalid token!" })
    }
}

//  CAST EMPTY STRING TO UNDEFINED, TO COMPLY WITH MONGOOSE MODEL CLASS VALIDATOR
export const modifiedCast = (string) => {
    if(string === ''){
        string = undefined
    }
return string
}

/* FORMAT LONG DECIMALS TO 2 DIGITS
export const roundOff = (v) => {
    // JS WON'T SAVE 0 VALUES ON THE RIGHT (E.G 1.00 => 1; 1.10 => 1.1)
    let fix = v.toString()
    if(!v.match(/\./)){
        fix = v.concat('.', '00')
        fix = Number(fix)
        console.log('if: '+fix, typeof(fix))
        return fix
    }
    const arrNum = v.split('.')
    const decimalCount = arrNum[1].length
    switch(decimalCount){
    case 1:
        fix = arrNum[0].concat('.', arrNum[1]).concat('0')        
        fix = Number(fix)
        return fix
    default:
        let decimal = arrNum[1].substring(0, 2)    
        fix = arrNum[0].concat('.', decimal)
        fix = Number(fix)
        return fix
    }
}*/
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

export const objExist = (queryResponse) => {
    const response = { htmlStatus: NaN, msg: ''}
    const callBack = Object.create(response)

    if(queryResponse === undefined || queryResponse === null || queryResponse.length == 0){
        callBack.htmlStatus = 404
        callBack.msg = 'Oh não! O que você procura parece que não existe, verifique os parâmetros de busca.'
        return callBack
    } else {
        callBack.htmlStatus = 200
        callBack.msg = queryResponse
        return callBack
    }
}
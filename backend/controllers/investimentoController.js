import Investimento from '../models/Investimento.js'
import { validarDados, objExiste } from '../utils/validacoes.js'
import { toLocal, toBrl } from '../utils/currencyFormat.js'

// CONVERTER JUROS AO ANO PARA JUROS AO DIA
const calcularJurosAoDia = (rentabilidadeAnual) => {
    return ( ( (1+(rentabilidadeAnual/100) )**(1/360) ) -1)
}

const calcularLucro = async (indexador, rentabilidadeAnual, valorInvestido, prazo) => {
    let resultado, jurosAoDia, jurosTotais
    // PESQUISAR UMA API PARA PUXAR ESSES DADOS ATUALIZADOS
    const cdi = 13.65
    const ipca = 3.16

    switch(indexador){
        case 'pre':
            jurosAoDia = await calcularJurosAoDia(rentabilidadeAnual)
            resultado = ( valorInvestido * ( 1 + jurosAoDia) ** prazo ) - valorInvestido
            return Number(resultado)
        case 'pos':
            // FALTA UM IF VALIDANDO SE A RENTABILIDADE É % DA CDI OU CDI + SPREAD
            jurosTotais = ( (rentabilidadeAnual * cdi) / 100 )
            jurosAoDia = await calcularJurosAoDia(jurosTotais)
            resultado = ( valorInvestido * ( 1 + jurosAoDia) ** prazo ) - valorInvestido
            return Number(resultado)
        case 'misto':
            jurosTotais = (rentabilidadeAnual + ipca)
            jurosAoDia = await calcularJurosAoDia(jurosTotais)
            resultado = ( valorInvestido * ( 1 + jurosAoDia) ** prazo ) - valorInvestido
            return Number(resultado)
    }
}

export const calculadora = async (tipoInvest, indexador, valorInvestido, prazo, rentabilidadeAnual) => {
    try {            
        // ARRAY DE IMPOSTO DE RENDA
        const isentoIr = ['lci', 'lca', 'cri', 'cra', 'poupança']
        const naoIsentoIr = ['cdb', 'tesouro']

        // INVEST ISENTO DE IR
        if (isentoIr.includes(tipoInvest)){
            const lucro = await calcularLucro(indexador, rentabilidadeAnual, valorInvestido, prazo)
            const rendimentos = Number(lucro + valorInvestido)

            const resultado = {
                valorTotalBruto: rendimentos,
                valorJuros: lucro,
                valorTotalLiquido: rendimentos,
                impostoRenda: {
                    valor: 0,
                    incidente: false
                }
            }
            return resultado
        }

        // INVEST INCIDENTE DE IR
        if (naoIsentoIr.includes(tipoInvest)){
            const lucro = await calcularLucro(indexador, rentabilidadeAnual, valorInvestido, prazo)
            let rendimentos, aliquotaIr, lucroLiq, irCobrado
            let resultado = {}

            // IMPOSTO DE RENDA REGRESSIVO
            if (prazo < 181){
                aliquotaIr = 0.225
                irCobrado = (Number(lucro) * aliquotaIr)
                lucroLiq = (Number(lucro) - Number(irCobrado))
                rendimentos = lucroLiq + valorInvestido

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true
                    }
                }
                return resultado
            }

            if (prazo > 180 && prazo < 361){
                aliquotaIr = 0.20
                irCobrado = (Number(lucro) * aliquotaIr)
                lucroLiq = (Number(lucro) - Number(irCobrado))
                rendimentos = lucroLiq + valorInvestido

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true
                    }
                }
                return resultado
            }

            if (prazo > 360 && prazo < 720){
                aliquotaIr = 0.175
                irCobrado = (Number(lucro) * aliquotaIr)
                lucroLiq = (Number(lucro) - Number(irCobrado))
                rendimentos = lucroLiq + valorInvestido

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true
                    }
                }
                return resultado
            }

            if (prazo > 721){
                aliquotaIr = 0.15
                irCobrado = (Number(lucro) * aliquotaIr)
                lucroLiq = (Number(lucro) - Number(irCobrado))
                rendimentos = lucroLiq + valorInvestido

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true
                    }
                }
                return resultado
            }
        }
    }
    catch (e) {
        console.error(e)
        return e        
    } 
}

export const create = async (req, res) => {
    try {
        const {nome, tipoInvest, indexador, valorInvestido, prazoMeses, rentabilidadeAnual, criadorId} = req.body
        const novoInvest = {nome, tipoInvest, indexador, valorInvestido, prazoMeses, rentabilidadeAnual, criadorId}
        
        const erro = await validarDados(novoInvest)
        if(erro){
            return res.status(422).json({msg: erro})
        }

        // CALCULAR O PRAZO DO INVESTIMENTO, EM DIAS
        const prazo = Number(prazoMeses) * 30

        const resultado = await calculadora(tipoInvest, indexador, Number(valorInvestido), Number(prazo), Number(rentabilidadeAnual))
        
        const invest = new Investimento({
            nome,
            tipo: tipoInvest,
            indexador,
            prazo,
            valorInvestido,
            valorJuros: resultado.valorJuros,
            valorTotalBruto: resultado.valorTotalBruto,            
            valorTotalLiquido: resultado.valorTotalLiquido,
            impostoRenda: {
                valor: resultado.impostoRenda.valor,
                incidente: resultado.impostoRenda.incidente
            },
            criadorId
        })

        try {
            await invest.save()
            res.status(201).json({msg: 'Simulação de investimento criada!', invest})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}

export const getOne = async (req, res) => {
    const id = req.params.id

    const invest = await objExiste(await Investimento.findById(id))

    return res.status(invest.htmlStatus).json({ msg: invest.msg })
}

export const getWhere = async (req, res) => {
    try {
        const condition = req.body.condition

        try {
            const query = await Investimento.find(condition)
            res.status(200).json({Encontrados: query.length, Investimentos: query})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}

export const getAll = async (req, res) => {
    const invest = await objExiste(await Investimento.find({}))

    return res.status(invest.htmlStatus).json({ Total: invest.msg.length, Investimentos: invest.msg })
}

export const remove = async (req, res) => {
    try {
        const id = req.params.id

        const validacao = await objExiste(await Investimento.findById(id))

        if(validacao.htmlStatus == 404){
            return res.status(validacao.htmlStatus).json({ msg: validacao.msg }) 
        }

        const invest = validacao.msg

        try {
            const query = await invest.deleteOne({id: id})
            res.status(200).json({msg: query.nome + " (id: " + query._id + ") " + 'removido da base de dados!'})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Server error.' + e + ' Please, try again!'})
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
            const query = await Investimento.deleteMany(condition)
            res.status(200).json({'Investimentos removidos': query.deletedCount})
        } catch (e) {
            console.error(e)
            res.status(500).json({msg: 'Erro no servidor. Por favor, tente novamente!'})
        }

    } catch (e) {
        console.error(e)
        res.status(400).json({msg: 'Requisição inválida. Por favor, tente novamente.'})
    }
}
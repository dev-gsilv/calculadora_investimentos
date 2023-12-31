import Investimento from '../models/Investimento.js';
import { validarDados, objExiste } from '../utils/validacoes.js';
import { cdiAtual, ipcaAtual } from '../utils/indicadores.js';
import objToConsole from '../utils/objPrint.js';

// CONVERTER JUROS AO ANO PARA JUROS AO DIA
const calcularJurosAoDia = rentabilidadeAnual =>
    (1 + rentabilidadeAnual / 100) ** (1 / 360) - 1;

const calcularLucro = async (
    indexador,
    rentabilidadeAnual,
    valorInvestido,
    prazo,
) => {
    let resultado;
    let jurosAoDia;
    let jurosTotais;
    const cdi = cdiAtual;
    const ipca = ipcaAtual;

    switch (indexador) {
        case 'pre':
            jurosAoDia = await calcularJurosAoDia(rentabilidadeAnual);
            resultado =
                valorInvestido * (1 + jurosAoDia) ** prazo - valorInvestido;
            return Number(resultado);

        case 'pos':
            // FALTA UM IF VALIDANDO SE A RENTABILIDADE É % DA CDI OU CDI + SPREAD
            // A FUNCIONALIDADE ATUAL CONSIDERA APENAS % DA CDI
            jurosTotais = (rentabilidadeAnual * cdi) / 100;
            jurosAoDia = await calcularJurosAoDia(jurosTotais);
            resultado =
                valorInvestido * (1 + jurosAoDia) ** prazo - valorInvestido;
            return Number(resultado);

        case 'misto':
            jurosTotais = rentabilidadeAnual + ipca;
            jurosAoDia = await calcularJurosAoDia(jurosTotais);
            resultado =
                valorInvestido * (1 + jurosAoDia) ** prazo - valorInvestido;
            return Number(resultado);

        default:
            return 'Opção inválida';
    }
};

export const calculadora = async (
    tipoInvest,
    indexador,
    valorInvestido,
    prazo,
    rentabilidadeAnual,
) => {
    try {
        // ARRAY DE IMPOSTO DE RENDA
        const isentoIr = ['lci', 'lca', 'cri', 'cra', 'poupança'];
        const naoIsentoIr = ['cdb', 'tesouro'];

        // INVEST ISENTO DE IR
        if (isentoIr.includes(tipoInvest)) {
            const lucro = await calcularLucro(
                indexador,
                rentabilidadeAnual,
                valorInvestido,
                prazo,
            );
            const rendimentos = Number(lucro + valorInvestido);

            const resultado = {
                valorTotalBruto: rendimentos,
                valorJuros: lucro,
                valorTotalLiquido: rendimentos,
                impostoRenda: {
                    valor: 0,
                    incidente: false,
                },
            };
            return resultado;
        }

        // INVEST INCIDENTE DE IR
        if (naoIsentoIr.includes(tipoInvest)) {
            const lucro = await calcularLucro(
                indexador,
                rentabilidadeAnual,
                valorInvestido,
                prazo,
            );
            let rendimentos;
            let aliquotaIr;
            let lucroLiq;
            let irCobrado;
            let resultado = {};

            // IMPOSTO DE RENDA REGRESSIVO
            if (prazo < 181) {
                aliquotaIr = 0.225;
                irCobrado = Number(lucro) * aliquotaIr;
                lucroLiq = Number(lucro) - Number(irCobrado);
                rendimentos = lucroLiq + valorInvestido;

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true,
                    },
                };
                return resultado;
            }

            if (prazo > 180 && prazo < 361) {
                aliquotaIr = 0.2;
                irCobrado = Number(lucro) * aliquotaIr;
                lucroLiq = Number(lucro) - Number(irCobrado);
                rendimentos = lucroLiq + valorInvestido;

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true,
                    },
                };
                return resultado;
            }

            if (prazo > 360 && prazo < 721) {
                aliquotaIr = 0.175;
                irCobrado = Number(lucro) * aliquotaIr;
                lucroLiq = Number(lucro) - Number(irCobrado);
                rendimentos = lucroLiq + valorInvestido;

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true,
                    },
                };
                return resultado;
            }

            if (prazo > 721) {
                aliquotaIr = 0.15;
                irCobrado = Number(lucro) * aliquotaIr;
                lucroLiq = Number(lucro) - Number(irCobrado);
                rendimentos = lucroLiq + valorInvestido;

                resultado = {
                    valorTotalBruto: valorInvestido + lucro,
                    valorJuros: Number(lucroLiq),
                    valorTotalLiquido: Number(rendimentos),
                    impostoRenda: {
                        valor: irCobrado,
                        incidente: true,
                    },
                };
                return resultado;
            }
        }
    } catch (e) {
        console.error(e);
        return e;
    }
};

export const create = async (req, res) => {
    try {
        const {
            nome,
            tipoInvest,
            indexador,
            valorInvestido,
            prazoMeses,
            rentabilidadeAnual,
        } = req.body;
        const criadorId = req.get('usuarioId');
        const novoInvest = {
            nome,
            tipoInvest,
            indexador,
            valorInvestido,
            prazoMeses,
            rentabilidadeAnual,
            criadorId,
        };

        const erro = await validarDados(novoInvest);
        if (erro) {
            return res.status(422).json({ msg: erro });
        }

        // CALCULAR O PRAZO DO INVESTIMENTO, EM DIAS
        const prazo = Number(prazoMeses) * 30;

        const resultado = await calculadora(
            tipoInvest,
            indexador,
            Number(valorInvestido),
            Number(prazo),
            Number(rentabilidadeAnual),
        );

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
                incidente: resultado.impostoRenda.incidente,
            },
            criadorId,
        });

        try {
            await invest.save();
            res.status(201).json({
                msg: 'Simulação de investimento criada!',
                invest,
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                msg: 'Erro no servidor. Por favor, tente novamente!',
            });
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({
            msg: 'Requisição inválida. Por favor, tente novamente.',
        });
    }
};

export const getOne = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.get('usuarioId');
    const role = req.get('role');
    let query;

    if (role === 'admin') {
        query = await objExiste(await Investimento.findById(id));
        return res.status(query.httpCode).json({ msg: query.msg });
    }

    if (role === 'usuario') {
        query = await objExiste(await Investimento.findById(id));

        if (query.httpCode === 404) {
            return res.status(query.httpCode).json({ msg: query.msg });
        }

        const investimento = query.msg;

        if (usuarioId !== investimento.criadorId.toString()) {
            return res
                .status(403)
                .json({ msg: 'Você não tem permissão para ver este recurso!' });
        }
        return res.status(200).json({ msg: investimento });
    }
};

export const getWhere = async (req, res) => {
    try {
        const { condition } = req.body;
        const usuarioId = req.get('usuarioId');
        const role = req.get('role');

        try {
            if (role === 'admin') {
                const query = await objExiste(
                    await Investimento.find(condition),
                );
                return res
                    .status(query.httpCode)
                    .json({ Total: query.msg.length, adminView: query.msg });
            }
            if (role === 'usuario') {
                const usuarioFiltro = { criadorId: usuarioId };
                const filtro = Object.assign(usuarioFiltro, condition);

                const arrayInvestimentos = await Investimento.find(filtro);
                const query = await objExiste(arrayInvestimentos);
                return res.status(query.httpCode).json({
                    Total: arrayInvestimentos.length,
                    Lista: query.msg,
                });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({
                msg: 'Erro no servidor. Por favor, tente novamente!',
            });
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({
            msg: 'Requisição inválida. Por favor, tente novamente.',
        });
    }
};

export const getAll = async (req, res) => {
    const usuarioId = req.get('usuarioId');
    const role = req.get('role');
    let query;

    if (role === 'admin') {
        query = await objExiste(await Investimento.find({}));
        return res
            .status(query.httpCode)
            .json({ Total: query.msg.length, adminView: query.msg });
    }
    if (role === 'usuario') {
        const arrayInvestimentos = await Investimento.find({
            criadorId: usuarioId,
        });
        query = await objExiste(arrayInvestimentos);
        return res
            .status(query.httpCode)
            .json({ Total: arrayInvestimentos.length, Lista: query.msg });
    }
};

export const remove = async (req, res) => {
    try {
        const investimentoId = req.params.id;
        const role = req.get('role');
        const usuarioId = req.get('usuarioId');
        let query;

        query = await objExiste(await Investimento.findById(investimentoId));

        if (query.httpCode === 404) {
            return res.status(query.httpCode).json({ msg: query.msg });
        }

        const investimento = query.msg;

        try {
            if (role === 'admin') {
                query = await investimento.deleteOne({
                    _id: investimentoId,
                });
                return res.status(200).json({
                    msg:
                        `${query.nome} (id: ${query._id}) ` +
                        'removido da base de dados!',
                });
            }
            if (role === 'usuario') {
                if (usuarioId !== investimento.criadorId.toString()) {
                    return res.status(403).json({
                        msg: 'Você não tem permissão para remover este recurso!',
                    });
                }
                query = await investimento.deleteOne({
                    _id: investimentoId,
                });
                return res.status(204).json({
                    msg:
                        `${query.nome} (id: ${query._id}) ` +
                        'removido da base de dados!',
                });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({
                msg: `Server error.${e} Please, try again!`,
            });
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({
            msg: 'Requisição inválida. Por favor, tente novamente.',
        });
    }
};

export const removeWhere = async (req, res) => {
    try {
        const { condition } = req.body;
        const usuarioId = req.get('usuarioId');
        const role = req.get('role');
        let query;

        try {
            if (role === 'admin') {
                query = await Investimento.deleteMany(condition);
                res.status(200).json({
                    'Investimentos removidos': query.deletedCount,
                });
            }
            if (role === 'usuario') {
                const usuarioFiltro = { criadorId: usuarioId };
                const filtro = Object.assign(usuarioFiltro, condition);

                query = await Investimento.deleteMany(filtro);
                return res
                    .status(200)
                    .json({ 'Investimentos removidos': query.deletedCount });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({
                msg: 'Erro no servidor. Por favor, tente novamente!',
            });
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({
            msg: 'Requisição inválida. Por favor, tente novamente.',
        });
    }
};

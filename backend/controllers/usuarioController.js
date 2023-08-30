import bcrypt from 'bcrypt';
import {
    validarNovoUsuario,
    validarSenha,
    objExiste,
} from '../utils/validacoes.js';
import Usuario from '../models/Usuario.js';
import objToConsole from '../utils/objPrint.js';

const templateRbac = async (req, res) => {
    const usuarioId = req.get('usuarioId');
    const role = req.get('role');
    let query;
    let resource;

    if (role === 'admin') {
        resource = await Model.find({});
        query = await objExiste(resource);
        return res.status(query.httpCode).json({ msg: query.msg });
    }

    if (role === 'usuario') {
        resource = await Model.find({ param: value });
        query = await objExiste(resource);

        if (query.httpCode === 404) {
            return res.status(query.httpCode).json({ Erro: query.msg });
        }

        if (usuarioId !== resource.ID) {
            return res.status(403).json({
                Erro: 'Você não tem permissão para ver este recurso!',
            });
        }
        return res.status(200).json({ msg: resource });
    }
};

export const create = async (req, res) => {
    const { nome, email, senha } = req.body;

    const novoUsuario = { nome, email, senha };
    const erro = await validarNovoUsuario(novoUsuario);
    if (erro) {
        return res.status(400).json({ msg: erro });
    }

    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    const usuarioValidado = new Usuario({
        nome,
        email,
        senha: senhaHash,
    });

    try {
        await usuarioValidado.save();
        const resource = await Usuario.find({
            email: usuarioValidado.email,
        });
        res.status(201).json({
            msg: `Bem-vindo ao Simulfix, ${resource[0].nome}!`,
            ID: resource[0]._id,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            msg: 'Erro no servidor. Por favor, tente novamente!',
        });
    }
};

export const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.get('usuarioId');
        const role = req.get('role');
        let query;
        let resource;

        if (role === 'admin') {
            resource = await Usuario.findById(id, '-senha');
            query = await objExiste(resource);
            return res.status(query.httpCode).json({ msg: query.msg });
        }

        if (role === 'usuario') {
            resource = await Usuario.findById(id, '-senha -role');
            query = await objExiste(resource);

            if (query.httpCode === 404) {
                return res.status(query.httpCode).json({ Erro: query.msg });
            }

            if (usuarioId !== id) {
                return res.status(403).json({
                    Erro: 'Você não tem permissão para ver este recurso!',
                });
            }
            return res.status(200).json({ Usuario: resource });
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({
            msg: 'Requisição inválida. Por favor, tente novamente.',
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const role = req.get('role');
        let query;
        let resource;

        if (role === 'admin') {
            resource = await Usuario.find({}, '-senha');
            query = await objExiste(resource);
            return res.status(query.httpCode).json({
                Total: resource.length,
                'Usuarios (admin_view)': resource,
            });
        }

        if (role === 'usuario') {
            return res.status(403).json({
                Erro: 'Voce nao tem permissao para fazer esta requisiçao!',
            });
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({
            msg: 'Requisição inválida. Por favor, tente novamente.',
        });
    }
};

export const update = async (req, res) => {
    try {
        const usuarioId = req.get('usuarioId');
        const role = req.get('role');
        const { nome, senhaAntiga, senhaNova } = req.body;
        const { id } = req.params;
        let query;
        let resource;

        if (role === 'admin') {
            resource = await Usuario.findById(id);
            query = await objExiste(resource);

            if (query.httpCode === 404) {
                return res.status(query.httpCode).json({ msg: query.msg });
            }

            if (senhaAntiga && senhaNova) {
                const senhaValida = await validarSenha(
                    senhaAntiga,
                    resource.senha,
                );
                if (!senhaValida) {
                    return res.status(422).json({ msg: 'Senha incorreta!' });
                }

                const salt = await bcrypt.genSalt(12);
                const senhaHash = await bcrypt.hash(senhaNova, salt);
                resource.senha = senhaHash;
            }

            if (nome) {
                resource.nome = nome;
            }

            try {
                await resource.save();
                res.status(200).json({ msg: 'Usuário atualizado!' });
            } catch (e) {
                console.error(e);
                res.status(500).json({
                    msg: 'Erro no servidor. Por favor, tente novamente!',
                });
            }
        }
        if (role === 'usuario') {
            if (usuarioId !== id) {
                return res.status(403).json({
                    Erro: 'Voce nao tem permissao para fazer esta requisiçao!',
                });
            }

            resource = await Usuario.findById(id);
            query = await objExiste(resource);

            if (query.httpCode === 404) {
                return res.status(query.httpCode).json({ msg: query.msg });
            }

            if (senhaAntiga && senhaNova) {
                const senhaValida = await validarSenha(
                    senhaAntiga,
                    resource.senha,
                );
                if (!senhaValida) {
                    return res.status(422).json({ msg: 'Senha incorreta!' });
                }

                const salt = await bcrypt.genSalt(12);
                const senhaHash = await bcrypt.hash(senhaNova, salt);
                resource.senha = senhaHash;
            }

            if (nome) {
                resource.nome = nome;
            }

            try {
                await resource.save();
                res.status(200).json({ msg: 'Usuário atualizado!' });
            } catch (e) {
                console.error(e);
                res.status(500).json({
                    msg: 'Erro no servidor. Por favor, tente novamente!',
                });
            }
        }
    } catch (e) {
        console.error(e);
        res.status(400).json({
            msg: 'Requisição inválida. Por favor, tente novamente.',
        });
    }
};

export const remove = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.get('usuarioId');
    const role = req.get('role');
    let query;
    let resource;

    if (role === 'admin') {
        try {
            resource = await Usuario.findById(id);
            query = await objExiste(resource);

            if (query.httpCode === 404) {
                return res.status(query.httpCode).json({ msg: query.msg });
            }

            const usuarioPerfil = query.msg;

            try {
                query = await usuarioPerfil.deleteOne({ id });
                res.status(200).json({
                    msg: 'Usuario removido!',
                    Usuario_ID: query._id,
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
    }

    if (role === 'usuario') {
        try {
            resource = await Usuario.findById(id);
            query = await objExiste(resource);

            if (query.httpCode === 404) {
                return res.status(query.httpCode).json({ msg: query.msg });
            }

            const usuarioPerfil = query.msg;

            if (usuarioId !== id) {
                return res.status(403).json({
                    Erro: 'Você não tem permissão para ver este recurso!',
                });
            }
            try {
                query = await usuarioPerfil.deleteOne({ id });
                res.status(200).json({
                    msg: 'Usuario removido!',
                    Usuario_ID: query._id,
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
    }
};

export const removeWhere = async (req, res) => {
    const role = req.get('role');
    let query;

    if (role === 'admin') {
        try {
            const { condition } = req.body;

            try {
                query = await Usuario.deleteMany(condition);
                res.status(200).json({
                    'Usuários removidos: ': query.deletedCount,
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
    }

    if (role === 'usuario') {
        return res.status(403).json({
            Erro: 'Voce nao tem permissao para fazer esta requisição!',
        });
    }
};

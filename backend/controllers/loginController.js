import jwt from 'jsonwebtoken';
import { validarCredenciais } from '../utils/validacoes.js';
import 'dotenv/config';

export const login = async (req, res) => {
    const authReader = req.headers.authorization;

    if (!authReader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res
            .status(401)
            .json({ Erro: 'Falha durante o login. Tente novamente!' });
    }

    const auth = new Buffer.from(authReader.split(' ')[1], 'base64')
        .toString()
        .split(':');
    const email = auth[0];
    const senha = auth[1];

    const checarCredenciais = await validarCredenciais(email, senha);

    if (checarCredenciais.httpCode !== 100) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).json({ Erro: checarCredenciais.msg });
    }

    try {
        const secret = process.env.SECRET;
        const usuario = checarCredenciais.msg;
        const token = jwt.sign({ id: usuario._id }, secret);

        res.status(200).json({
            msg: 'Usuário autenticado com sucesso!',
            token,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            msg: 'Erro no servidor. Por favor, tente novamente!',
        });
    }
};

// Role-based access control (RBAC)
import { AccessControl } from 'accesscontrol'
import Investimento from '../models/Investimento.js';
import objToConsole from '../utils/objPrint.js'

let grantObjects = {
    usuario: {
        investimento: {
            'create:own': ['*'],
            'read:own': ['*'],
            'delete:own': ['*']
        },
        usuario: {
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*']
        },
    },
    admin: {
        investimento: {
            'create:any': ['*'],
            'read:any': ['*'],
            'delete:any': ['*']
        },
        usuario: {
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*']
        },
    }
}
    
const ac = new AccessControl(grantObjects);

export const validarPermissao = async (req, res, next) => {

    const investimento = await Investimento.findById(req.params.id).populate('criadorId').exec()
    const criadorId = investimento._doc.criadorId

    let permission = ac.can(req.body.role).readAny("investimento");

    if (!permission.granted) {
        if ((criadorId._id.toString()) == req.body.usuarioId) {
            permission = ac.can(req.body.role).readOwn("investimento");
        }
    if (permission.granted) {
        next()
    } else {
        res.status(403).send('Você não tem permissão para visualizar este recurso!').end();
    }}
}
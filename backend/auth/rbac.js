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

export const permissionMiddleware = async (req, res, next) => {
    try {
        const loggedRole = req.body.role

        // ADMIN CASE
        let permission = ac.can(loggedRole).readAny("investimento") && ac.can(loggedRole).deleteAny("investimento")

        //console.log('admin case '+permission.granted)

        // USUARIO COMUM CASE
        if (!permission.granted) {
            permission = ac.can(loggedRole).readOwn("investimento") && ac.can(loggedRole).deleteOwn("investimento");
            //console.log('usuario case '+permission.granted)

        }

        if (permission.granted) {
            //console.log('next() case '+permission.granted)
            next()
        } else {
            res.status(403).send({msg: 'Você não tem permissão para visualizar/alterar este recurso.'}).end();
        }

    } catch (e) {
        console.log(e)
        res.status(500).send({msg: 'Erro no servidor. Tente novamente'});

    }
}
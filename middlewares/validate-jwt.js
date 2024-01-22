const { response } = require('express');
const jwt = require('jsonwebtoken');


const validateJWT = ( req, res = response, next ) => {

    // Voy a pedir el token en el header en x-token
    const token = req.header('x-token');
    
    if( !token ){
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la peticion'
        })
    }

    try {

        // Extraigo el payload del token
        const { uid, name } = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED
        );

        // Modifico la request, le agrego el payload
        req.uid = uid;
        req.name = name;

        
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no valido'
        });
    }

    next();

}

module.exports = {
    validateJWT
}
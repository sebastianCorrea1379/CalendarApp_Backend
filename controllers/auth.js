const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateJWT } = require('../helpers/jwt');



const createUser = async( req, res = response ) => {
    
    const { email, password } = req.body;

    try {

        // Ver si esxiste ya un usuario con ese email
        let user = await User.findOne({ email });

        if ( user ) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con ese correo'
            });
        }

        user = new User( req.body );

        // Encriptar contrasena
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync( password, salt );

        // Guardar usuario en base de datos
        await user.save();

        // Generar nuestro JWT
        const token = await generateJWT( user.id, user.name );


        res.status(201).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token 
        });
        
    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })

    }

}



const loginUser =  async( req, res = response ) => {
    
    const { email, password } = req.body;

    try {

        // Ver si no esxiste un usuario con ese email
        let user = await User.findOne({ email });

        if ( !user ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese correo'
            });
        }

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync( password, user.password );

        if( !validPassword ){
            return res.status( 400 ).json({
                ok: false,
                msg: 'Password incorrecto'
            })
        }

        // Generar nuestro JWT
        const token = await generateJWT( user.id, user.name );

        res.json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        })
        
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })
        
    }

}



const revalidateToken = async( req, res = response ) => {

    const { uid, name } = req;

    // Generar un nuevo JWT y retornarlo en esta peticion
    const token = await generateJWT( uid, name );

    res.json({
        ok: true,
        token
    });

}


module.exports = {
    createUser,
    loginUser,
    revalidateToken
}
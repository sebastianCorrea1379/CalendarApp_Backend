const { response } = require('express');
const Event = require('../models/Event');


const getEvents = async( req, res = response ) => {

    // El populate es para rellenar referencias del objeto
    // en este caso como tenemos referencia al usuario con el id pues lo utilizamos con user
    // Con el parametro donde puse name es lo que quiero que me devuelva para que no me devuielta todo como el email y password por ejemplo
    // Para poner varios se hace asi: 'name password', asi devolveria el name y el password
    // El id del usuario se regresa por defecto en este caso.  
    const events = await Event.find().populate('user', 'name');

    res.json({
        ok: true,
        events
    });

}

const createEvent = async( req, res = response ) => {

    const event = new Event( req.body );

    try {

        event.user = req.uid;

        const savedEvent = await event.save();

        res.status(201).json({
            ok:true,
            event: savedEvent
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

const updateEvent = async( req, res = response ) => {

    // Tomar el id que viene en la url
    const eventId = req.params.id;

    try {

        // Verificar que el id exista en la base de datos
        const event = await Event.findById( eventId );

        // Id de quien esta haciendo la peticion
        // Recordar que todas las req tienen el name y el id porque cuando se valida el token se extrae el payload del mismo
        const uid = req.uid;

        if( !event ) {
            // El 404 es cuando algun elemento en internet no existe
            return res.status(404).json({
                ok: false,
                msg: 'Evento no existe por ese id'
            });
        }

        // Verificar que el usuario que creo el evento sea la misma que lo quiere actualizar
        if( event.user.toString() !== uid ) {
            // El 401 es cuando alguien no esta autorizado a hacer algo
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de editar este evento'
            });
        }

        // Creamos un nuevo evento con la info actualizada
        const newEvent = {
            ...req.body,
            user: uid
        }
        // Actualizamos el evento en la base de datos
        // si queremos que se retorne a nosotros el viejo evento usamos esta linea:
        // const updatedEvent = await Event.findByIdAndUpdate( eventId, newEvent );
        // Si queremos que nos retorne el evento actualizado usamos:
        const updatedEvent = await Event.findByIdAndUpdate( eventId, newEvent, { new: true } );


        res.json({
            ok: true,
            event: updatedEvent
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

const deleteEvent = async( req, res = response ) => {

    // Tomar el id que viene en la url
    const eventId = req.params.id;

    try {

        // Verificar que el id exista en la base de datos
        const event = await Event.findById( eventId );

        // Id de quien esta haciendo la peticion
        // Recordar que todas las req tienen el name y el id porque cuando se valida el token se extrae el payload del mismo
        const uid = req.uid;

        if( !event ) {
            // El 404 es cuando algun elemento en internet no existe
            return res.status(404).json({
                ok: false,
                msg: 'Evento no existe por ese id'
            });
        }

        // Verificar que el usuario que creo el evento sea la misma que lo quiere eliminar
        if( event.user.toString() !== uid ) {
            // El 401 es cuando alguien no esta autorizado a hacer algo
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de eliminar este evento'
            });
        }

        // Eliminamos el evento de la base de datos
        const deletedEvent = await Event.findByIdAndDelete( eventId, );


        res.json({
            ok: true,
            event: deletedEvent
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}


module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
}
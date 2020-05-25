const { Router } = require('express');
const router = Router();
const { 
    renderNoteForm, 
    createNewNote, 
    renderNotes, 
    renderUserNotes,
    renderEditForm,
    renderReader,
    updateNote, 
    deleteNote,
    like,
    angry,
    funny,
    sad,
    love,
    report,
    search
} = require('../controllers/notes.controller')

// Authentication stuff
const { isAuthenticated } = require('../helpers/auth');

/* AGREGANDO ANECDOTA */
router.get('/anecdotas/nueva', isAuthenticated, renderNoteForm);
router.post('/anecdotas/agregar', isAuthenticated, createNewNote);

// OBTENER TODAS LAS ANECDOTAS
router.get('/anecdotas', renderNotes);
router.post('/anecdotas', search);

// OBTENER NOTAS PRIVADAS
router.get('/usuario/personal', isAuthenticated, renderUserNotes);

// EDITAR ANECDOTAS
router.get('/anecdotas/editar/:id', isAuthenticated, renderEditForm);
router.put('/anecdotas/editar/:id', isAuthenticated, updateNote);

// LEER ANECDOTA
router.get('/anecdotas/:id', renderReader);

// REACTIONS
router.get('/like/:id', isAuthenticated, like)
router.get('/angry/:id', isAuthenticated, angry)
router.get('/funny/:id', isAuthenticated, funny)
router.get('/sad/:id', isAuthenticated, sad)
router.get('/love/:id', isAuthenticated, love)

// ELIMINAR ANECDOTA
router.delete('/anecdotas/borrar/:id', isAuthenticated, deleteNote);

// REPORT
router.post('/report/:id', isAuthenticated, report)

/*
let mailOptions = {
    from: 'soporte@anecdotario.org',
    to: 'soft.pal.ef@gmail.com',
    subject: 'Reporte de usuario',
    text: 'REPORTE NUEVO'
}

transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
        console.log("EMAIL ERRO")
    } else {
        console.log("EMAIL SENT SUCCESSFULLY")
    }

})*/


module.exports = router;
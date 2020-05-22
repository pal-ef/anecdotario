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

// Like
router.get('/like/:id', isAuthenticated, like)

// ELIMINAR ANECDOTA
router.delete('/anecdotas/borrar/:id', isAuthenticated, deleteNote);

// Busqueda


module.exports = router;
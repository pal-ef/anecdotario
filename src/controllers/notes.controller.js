const notesCtrl = {};
const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');
const exphbs = require('handlebars')

notesCtrl.renderNoteForm = (req, res) =>{
    res.render('notes/new-note');
};

notesCtrl.createNewNote = async (req, res) => {
    const {title, description} = req.body;
    const newNote = new Note({title, description});
    newNote.user = req.user.id;
    newNote.username = req.user.name;
    newNote.userimg = req.user.profilepic;
    newNote.imageid = req.file.filename;
    newNote.likes = 0;
    newNote.usersliked = [];
    await newNote.save();
    req.flash('success', '¡Tu anécdota ha sido públicada!');
    res.redirect('/anecdotas?page=1&limit=12');
};

notesCtrl.renderNotes = async (req, res) => {
    /*const notes = await Note.find().lean().sort({createdAt: 'desc'});*/
    const notes = await Note.find().lean().sort({ createdAt: 'desc' });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1)*limit;
    const endIndex = page * limit;
    const notas = notes.slice(startIndex, endIndex);
    console.log(notas)
    res.render('notes/all-notes', { notas });
    
};

notesCtrl.renderUserNotes = async (req, res) => {
    const notes = await Note.find({ user: req.user.id }).lean().sort({ createdAt: 'desc' });
    const pic = req.user.profilepic;
    const user = req.user.name;
    const description = req.user.description;
    const ajoined = req.user.createdAt;
    const joined = ajoined.getDate() + "/" + (ajoined.getMonth()+1)+ "/" + ajoined.getFullYear();
    res.render('notes/user-notes', { notes, user, joined, pic, description });
};

notesCtrl.renderReader = async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    text = note.description
    text = exphbs.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    text = new exphbs.SafeString(text);
    const ajoined = note.createdAt;
    const bjoined = note.updatedAt;
    const joined = ajoined.getDate() + "/" + (ajoined.getMonth() + 1) + "/" + ajoined.getFullYear();
    const updated = bjoined.getDate() + "/" + (bjoined.getMonth() + 1) + "/" + bjoined.getFullYear();
    res.render('notes/reader', {note, text, joined, updated})
}

notesCtrl.renderEditForm = async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    if (note.user != req.user.id) {
        req.flash('error', 'No tienes autorización de editar esa nota.')
        return res.redirect('/anecdotas');
    }
    res.render('notes/edit-note', {note});
};

notesCtrl.updateNote = async (req, res) => {
    const { title, description } = req.body;
    await Note.findByIdAndUpdate(req.params.id, { title, description });
    req.flash('success', 'La anécdota ha sido editada')
    res.redirect('/usuario/personal');
};

notesCtrl.deleteNote = async (req, res) => {
    const note = await Note.findById(req.params.id);
    const file = path.join(__dirname,'../public/user/img', note.imageid);
    fs.unlink(file, (err) => {
        if (err) throw err;
        console.log('path/file.txt was deleted');
    });
    console.log(file);
    await Note.findByIdAndDelete(req.params.id);
    if (note.user != req.user.id) {
        req.flash('error', 'No tienes autorización de eliminar esa nota.')
        return res.redirect('/anecdotas');
    }
    req.flash('success', 'La anécdota ha sido eliminada')
    res.redirect('/anecdotas');
};

// LIKES
notesCtrl.like = async(req, res) => {
    
    const note = await Note.findById(req.params.id).lean();
    const newlikes = note.likes + 1;
    const user = note.usersliked;
    if (user.includes(req.user.id)) {
        req.flash('error', 'Ya indicaste que te gusta esta anécdota'); 
        res.redirect('/anecdotas/' + req.params.id)
    } else {
        user.push(req.user.id);
        req.flash('success', 'Indicaste que te gusta esta anécdota');
        await Note.findByIdAndUpdate(req.params.id, { likes: newlikes, usersliked: user });
        res.redirect('/anecdotas/' + req.params.id);
    }
    
}

// Search
notesCtrl.search = async(req, res) => {
    busqueda = {
        username: req.body.search
    }
    texto = req.body.search
    console.log(req.body.search)
    const notas = await Note.find(busqueda).lean().sort({createdAt: 'desc'});
    console.log(notas)
    res.render('notes/all-notes', {notas, texto});
}

module.exports = notesCtrl;


const notesCtrl = {};
const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');
const exphbs = require('handlebars')
const nodemailer = require('nodemailer')


/* OLD TRANSPORTER
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EPASS
    }
});
*/
var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EPASS
    }
});

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
    newNote.reactions = []
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
    reacts = 0
    notes.forEach(element => {
        element.reactions.forEach(element => {
            reacts += 1
        });
    });
    const pic = req.user.profilepic;
    const user = req.user.name;
    const description = req.user.description;
    const ajoined = req.user.createdAt;
    const joined = ajoined.getDate() + "/" + (ajoined.getMonth()+1)+ "/" + ajoined.getFullYear();
    res.render('notes/user-notes', { notes, user, joined, pic, description, reacts });
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

    // REACTIONS
    reactions = note.reactions
    likes = 0
    angries = 0
    funnies = 0
    sadness = 0
    lovely = 0
    reactions.forEach(element => {
        if (element.includes("like")){
            likes = likes + 1;
        } else if (element.includes("angry")) {
            angries = angries + 1;
        } else if (element.includes("funny")) {
            funnies = funnies + 1;
        } else if (element.includes("sad")) {
            sadness = sadness + 1;
        } else if (element.includes("love")) {
            lovely = lovely + 1;
        }
    });
    res.render('notes/reader', {note, text, joined, updated, angries, likes, funnies, sadness, lovely})
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

//          //
// REACTIONS//
//          //

notesCtrl.like = async (req, res) => {
    change = false
    const note = await Note.findById(req.params.id).lean();
    reactions = note.reactions;
    iteration = -1
    reactions.forEach(element => {
        iteration += 1
        if (element.includes(req.user.id)) {
            change = true
            index = iteration
        }
        else {
            change = false
        }
    });
    if (change) {
        if (reactions[iteration].includes("like")) {
            reactions.splice(iteration, 1)
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        } else {
        reactions[iteration] = [req.user.id, "like"]
        await Note.findByIdAndUpdate(req.params.id, { reactions });
        res.redirect('/anecdotas/' + req.params.id);
        }
    } else {
        reactions.push([req.user.id, "like"]);
        await Note.findByIdAndUpdate(req.params.id, { reactions });
        res.redirect('/anecdotas/' + req.params.id);
    }
}

notesCtrl.angry = async (req, res) => {
    change = false
    const note = await Note.findById(req.params.id).lean();
    reactions = note.reactions;
    iteration = -1
    reactions.forEach(element => {
        iteration += 1
        if (element.includes(req.user.id)) {
            change = true
            index = iteration
        }
        else {
            change = false
        }
    });
    if (change) {
        if (reactions[iteration].includes("angry")) {
            reactions.splice(iteration, 1)
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        } else {
            reactions[iteration] = [req.user.id, "angry"]
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        }
    } else {
        reactions.push([req.user.id, "angry"]);
        await Note.findByIdAndUpdate(req.params.id, { reactions });
        res.redirect('/anecdotas/' + req.params.id);
    }
}

notesCtrl.funny = async (req, res) => {
    change = false
    const note = await Note.findById(req.params.id).lean();
    reactions = note.reactions;
    iteration = -1
    reactions.forEach(element => {
        iteration += 1
        if (element.includes(req.user.id)) {
            change = true
            index = iteration
        }
        else {
            change = false
        }
    });
    if (change) {
        if (reactions[iteration].includes("funny")) {
            reactions.splice(iteration, 1)
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        } else {
            reactions[iteration] = [req.user.id, "funny"]
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        }
    } else {
        reactions.push([req.user.id, "funny"]);
        await Note.findByIdAndUpdate(req.params.id, { reactions });
        res.redirect('/anecdotas/' + req.params.id);
    }
}

notesCtrl.sad = async (req, res) => {
    change = false
    const note = await Note.findById(req.params.id).lean();
    reactions = note.reactions;
    iteration = -1
    reactions.forEach(element => {
        iteration += 1
        if (element.includes(req.user.id)) {
            change = true
            index = iteration
        }
        else {
            change = false
        }
    });
    if (change) {
        if (reactions[iteration].includes("sad")) {
            reactions.splice(iteration, 1)
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        } else {
            reactions[iteration] = [req.user.id, "sad"]
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        }
    } else {
        reactions.push([req.user.id, "sad"]);
        await Note.findByIdAndUpdate(req.params.id, { reactions });
        res.redirect('/anecdotas/' + req.params.id);
    }
}

notesCtrl.love = async (req, res) => {
    change = false
    const note = await Note.findById(req.params.id).lean();
    reactions = note.reactions;
    iteration = -1
    reactions.forEach(element => {
        iteration += 1
        if (element.includes(req.user.id)) {
            change = true
            index = iteration
        }
        else {
            change = false
        }
    });
    if (change) {
        if (reactions[iteration].includes("love")) {
            reactions.splice(iteration, 1)
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        } else {
            reactions[iteration] = [req.user.id, "love"]
            await Note.findByIdAndUpdate(req.params.id, { reactions });
            res.redirect('/anecdotas/' + req.params.id);
        }
    } else {
        reactions.push([req.user.id, "love"]);
        await Note.findByIdAndUpdate(req.params.id, { reactions });
        res.redirect('/anecdotas/' + req.params.id);
    }
}

// Search
notesCtrl.search = async(req, res) => {
    busqueda = req.body.search
    texto = req.body.search
    console.log(req.body.search)
    const notas = await Note.find( { "username" : { $regex: new RegExp(busqueda, "i") } }).lean().sort({createdAt: 'desc'});
    console.log(notas)
    res.render('notes/all-notes', {notas, texto});
}

// REPORT
notesCtrl.report = async (req, res) => {
    let mailOptions = {
        from: '"Anecdotario" <soporte-anecdotario@hotmail.com>', // sender address (who sends)
        to: 'soft.pal.ef@gmail.com, p19.215644257@gmail.com, itzel.99lorenzana@gmail.com, bry-gonzalezz@hotmail.com, anecdotarioapp@gmail.com', // list of receivers (who receives)
        subject: 'REPORTE DE USUARIO',
        text: 'Reportaron la anécdota con ID: '+req.params.id+"\n------------------------------------\n"+"\nMensaje: \n"+req.body.msn
    }

    await transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("EMAIL ERROR")
            console.log(err)
            req.flash('error', 'Hubo un error al reportar. Vuelve a intentarlo más tarde')
            res.redirect('/anecdotas/' + req.params.id)
        } else {
            console.log("EMAIL SENT SUCCESSFULLY")
            req.flash('success', 'Gracias por ayudar a Anécdotario')
            res.redirect('/anecdotas/'+req.params.id)
        }

    })
} 

module.exports = notesCtrl;


const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const multer = require('multer');
const morgan = require('morgan');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const uuid = require('uuid');
var bodyParser = require('body-parser');

// Initializations
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/user/img'),
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + path.extname(file.originalname).toLocaleLowerCase());
    }
});
const app = express();
require('./config/passport');


// Settings
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));


app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(multer({
    storage,
    dest: path.join(__dirname, 'public/user/img'),
    limits: {
        fileSize: 5000000
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: debe ser un archivo válido (jpg, jpeg, png, gif) regresa a la página anterior")
    }
}).single('image'));


// Global Variables
app.use((req, res, next) =>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next()
});


// Routes
app.use(require('./routes/index.routes'));
app.use(require('./routes/notes.routes'));
app.use(require('./routes/users.routes'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ERROR HANDLING
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    console.log(error.status)
    res.status(error.status || 500)
    if (error.status == 404){
        req.flash('error', 'La página que buscas no existe.')
        res.redirect('/')
    }else if (error.status == 413){
        res.redirect('/')
    } else {
        req.flash('error', 'la imagen tiene que ser menor a 5MB y de formato JPG, PNG o GIF')
        res.redirect('/anecdotas/nueva')
    }
})



module.exports = app;
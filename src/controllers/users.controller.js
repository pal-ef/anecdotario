const usersCtrl = {};

const User = require('../models/User');
const passport = require('passport');

usersCtrl.renderSignUpForm = (req, res) => {
    res.render('users/signup');
};

usersCtrl.signup = async(req, res) => {
    const errors = [];
    const { name, email, password, confirm_password, description } = req.body;
    if (/\s/.test(name)) {
        errors.push({ text: 'El nombre de usuario no debe tener espacios.' });
    }
    if (name.length < 4){
        errors.push({text: 'El nombre de usuario debe contener más de 4 carácteres'});
    }
    if (password != confirm_password){
        errors.push({text: 'Las contraseñas no coinciden.'});
    }
    if (description.length > 50){
        errors.push({ text: 'Tu descripción tiene que ser menor a 50 carácteres.' });
    }
    if (password.length < 4){
        errors.push({text: 'La contraseña debe tener más de 4 carácteres'});
    }
    if (errors.length > 0){
        res.render('users/signup', {errors, name, email, description})
    } else {
        const emailUser = await User.findOne({email: email});
        const userName = await User.findOne({name: name})
        if (userName) {
            req.flash('error', 'Otra cuenta ya registró ese nombre de usuario.')
            res.redirect('/usuario/registro');
        }
        if (emailUser) {
            req.flash('error', 'Otra cuenta ya registró ese correo.')
            res.redirect('/usuario/registro');
        } else {
            const newUser = new User({name, email, password, profilepic: req.file.filename, description});
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            req.flash('success', 'Cuenta creada con éxito, ahora ingresa colocando tus datos')
            res.redirect('/usuario/acceder');
        }
    }
};

usersCtrl.renderSignInForm = (req, res) => {
    res.render('users/signin');
};

usersCtrl.signin = passport.authenticate('local', {
    failureRedirect: '/usuario/acceder',
    successRedirect: '/anecdotas?page=1&limit=12',
    failureFlash: true
});

usersCtrl.logout = (req, res) => {
    req.logout();
    req.flash('success', 'La sesión se ha cerrado.');
    res.redirect('/usuario/acceder');
};

module.exports = usersCtrl;
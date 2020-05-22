const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password'
}, async (email, password, done) => {

    // Checamos si existe el correo en la base de datos
    const userMail = await User.findOne({email});
    if (!userMail) {
        return done(null, false, {message: 'El usuario no existe.'});
    } else { // Checamos si la contraseña es correcta.
        const match = await userMail.matchPassword(password);
        if (match) {
            return done(null, userMail);
        } else {
            return done(null, false, {message: 'La contraseña es incorrecta.'})
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
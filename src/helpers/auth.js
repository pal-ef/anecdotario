const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'No estás autorizado. Sugerencia: inicia sesión.')
    res.redirect('/usuario/acceder');
};

module.exports = helpers;
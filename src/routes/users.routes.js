const {Router} = require('express');
const router = Router();
const { renderSignUpForm, renderSignInForm, signin, signup, logout } = require('../controllers/users.controller');

router.get('/usuario/registro', renderSignUpForm);

router.post('/usuario/registro', signup);

router.get('/usuario/acceder', renderSignInForm);

router.post('/usuario/acceder', signin);

router.get('/usuario/salir', logout);

module.exports = router;
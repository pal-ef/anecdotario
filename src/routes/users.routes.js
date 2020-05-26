const {Router} = require('express');
const router = Router();
const { renderSignUpForm, renderSignInForm, signin, signup, logout, normas } = require('../controllers/users.controller');

router.get('/usuario/registro', renderSignUpForm);

router.post('/usuario/registro', signup);

router.get('/usuario/acceder', renderSignInForm);

router.post('/usuario/acceder', signin);

router.get('/usuario/salir', logout);

router.get('/normas', normas)
module.exports = router;
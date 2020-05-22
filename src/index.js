require('dotenv').config();
const app = require('./server');
const database = require('./database');


// Server listens
app.listen(app.get('port'), () => {
    console.log('Server listening on ', app.get('port'));
});
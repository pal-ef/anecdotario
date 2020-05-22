const mongoose = require('mongoose');

// DATABASE
const { ANEC_MONGODB_HOST, ANEC_MONGODB_DATABASE } = process.env;
const MONGODB_URI = `mongodb://${ANEC_MONGODB_HOST}/${ANEC_MONGODB_DATABASE}`;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(db => console.log('Connected to database.'))
    .catch(err => console.log(err));
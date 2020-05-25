const {Schema, model } = require('mongoose');

const NoteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    imageid: {
        type: String,
        required: true,
    },
    reactions: {
        type: Array,
        required: false,
    },
    userimg: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = model('Note', NoteSchema);
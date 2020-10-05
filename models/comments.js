const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);

var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        required: true
    },
    dishes:  {
        type: mongoose.Schema.Types.ObjectId,
        ref:'dishes',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('comments',commentSchema);
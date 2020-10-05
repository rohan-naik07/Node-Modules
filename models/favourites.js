const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const favouriteSchema = new Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        required: true
    },
    dishes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'dishes',
    }]
},{timestamps: true});

module.exports = mongoose.model('favourites',favouriteSchema);
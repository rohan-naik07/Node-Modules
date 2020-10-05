const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportSchemamongoose = require('passport-local-mongoose'); // default schema for user auth

const UserSchema = new Schema(
    {
        firstname: { 
            type:String,
            default:'' },
        lastname: { 
            type:String,
            default:'' },
        facebookId: String,
         admin:   {
            type: Boolean,
            default: false
        }
    }
);
UserSchema.plugin(passportSchemamongoose);
module.exports = mongoose.model('users',UserSchema);
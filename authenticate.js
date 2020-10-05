var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./models/users');
const { ExtractJwt } = require('passport-jwt');
var FacebookTokenStrategy  = require('passport-facebook-token');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = function(user){
    return jwt.sign(user,config.secretKey,
        {expiresIn : 3600});
};

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;  // compulsory params

exports.jwtPassport = passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
    console.log("JWT payload: ", jwt_payload);
    User.findOne({_id: jwt_payload._id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        else if (user) {
            return done(null, user); // loads user prop in req
        }
        else {
            return done(null, false);
        }
    });
}));

exports.verifyUser = passport.authenticate('jwt',{session:false});
exports.verifyAdmin = function(req,res,next){
    if(req.user.admin){
        return next();
    }
    let error = new Error("You are not authorized to perform this operation!");
    error.status = 403;
    return next(error);
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
},(accessToken,refreshToken,profile,done)=>{
    User.findOne({facebookId:profile.id},(err,user)=>{
        if(err){
            console.log("Facebook Error");
            return done(err,false);
        }
        if(!err && user!==null){
            return done(null,user);
        }
        else{
            user = new User({ username : profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err){
                    console.log(err);
                    return done(err, false);
                }
                else
                    return done(null, user);
            })
        }
    });
}));

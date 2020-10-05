const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const favouritesRouter = express.Router();
const Favourites = require('../models/favourites');
const Dishes = require('../models/dishes');
var authenticate = require('../authenticate');
const cors = require('./cors');

favouritesRouter.use(bodyParser.json());

favouritesRouter.get('/',cors.cors,
authenticate.verifyUser,(req,res,next)=>{
    Favourites.find({user : req.user._id },(err,favorite)=>{
        if(err){ return next(err);}
        if(!favorite){
            res.statusCode = 403;
            res.end("No favorites found!!");
        }
    }).populate('user').populate('dishes').then((favourites)=>{
        res.statusCode = 200; 
        res.setHeader('Content-Type','application/json');
        res.json(favourites);
    },
    (error)=>{
        console.log(error);
        next(error);})
     .catch((error)=>{
         console.log(error);
         next(error);
    });
})
.post('/',cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favourites.findOne({user : req.user._id},(err,favourite)=>{
        if(err){
            next(err);
        }
        else if(!err && favourite!==null){
            var dishes = req.body;
            dishes.forEach(dish=>{
                if(favourite.dishes.indexOf(dish._id)===-1){ // if dish is not present already in favourites
                    favourite.dishes.push(dish);
                }

                favourite.save().then((favourite)=>{
                    Favourites.findById(favourite._id).populate('user').populate('dishes').then((favourite)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);
                    }) 
                });   
            })
        }
        else{
            Favourites.create({user:req.user._id}).then((favourite)=>{
                var dishes = req.body;
                dishes.forEach(dish => {
                    favorite.dishes.push(dish);
                });
                favourite.save().then((favourite)=>{
                    Favourites.findById(favourite._id).populate('user').populate('dishes').then((favourite)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);
                    }) 
                }) 
            },(err)=>{next(err)})
            .catch((error)=>{next(error)})
        }
    })
})
.put('/',cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete('/',cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favourites.remove({user:req.user._id}).then((resp)=>{
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

favouritesRouter.get('/:dishId',cors.cors,
authenticate.verifyUser,(req,res,next)=>{
    Favourites.findOne({user: req.user._id}).then((favourite)=>{
        if(!favourite){
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json');
            res.json({"exists": false,"favorites":favourite});
        }
        else{
            if(favourite.dishes.indexOf(req.params.dishId)<0){
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json({"exists": false,"favorites":favourite});
            }
            else{
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json({"exists": true,"favorites":favourite});
            }
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.post('/:dishId',cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favourites.findOne({user: req.user._id},(err,favorite)=>{
        if (err) {
            next(err);
        }
        else if (!err && favorite !== null) {
            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId);
            }
            favourite.save().then((favourite)=>{
                Favourites.findById(favourite._id).populate('user').populate('dishes').then((favourite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }) 
            }) 
        }
        else {
            Favorites.create({user: req.user._id})
            .then((favorite) => {
                favorite.dishes.push(req.params.dishId);
                favourite.save().then((favourite)=>{
                    Favourites.findById(favourite._id).populate('user').populate('dishes').then((favourite)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);
                    }) 
                }) 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    })
})
.put('/:dishId',cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:dishId');
})
.delete('/:dishId',cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favourites.findOne({user: req.user._id},(err,favorite)=>{
        if (err) {
            next(err);
        }
        if(!favorite){
            res.statusCode = 200;
            res.end("No favorite to delete");
        }

        var index = favorite.dishes.indexOf(req.params.dishId);
        if (index !== -1) {
            favorite.dishes.splice(index,1);
            favourite.save().then((favourite)=>{
                Favourites.findById(favourite._id).populate('user').populate('dishes').then((favourite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourite);
                }) })
            }})
        })

module.exports = favouritesRouter;
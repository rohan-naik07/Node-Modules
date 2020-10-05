const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const express = require('express');
const bodyParser = require('body-parser');
const dishRouter = express.Router();
var authenticate = require('../authenticate');
const cors = require("./cors");

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
   Dishes.find(req.query).populate('comments.author').then((dishes)=>{
       res.statusCode = 200; 
       res.setHeader('Content-Type','application/json');
       res.json(dishes);
   },
   (error)=>{
       console.log(error);
       next(error);})
    .catch((error)=>{
        console.log(error);
        next(error);});
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.create(req.body).then((dish)=>{
        console.log("Dish created : " + dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    },(error)=>{next(error)})
    .catch((error)=>{next(error)});
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Dishes.findById(req.params.dishId).populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId,
        { $set : req.body },
        { new : true }).then((dish)=>{
            Dishes.findById(dish._id).populate('comments.author')
            .then((dish)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            });
        }, (err) => next(err))
        .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = dishRouter;
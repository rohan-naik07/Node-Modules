const mongoose = require('mongoose');
const Comments = require('../models/comments');
const express = require('express');
const bodyParser = require('body-parser');
const commentsRouter = express.Router();
var authenticate = require('../authenticate');
const cors = require("./cors");

commentsRouter.use(bodyParser.json());

commentsRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Comments.find(req.query).populate('author').then((comments)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res,json(comments);
    },(error)=>next(error))
    .catch((error)=>next(error));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.author = req.user._id;
        Comments.create(req.body)
        .then((comment) => {
            Comments.findById(comment._id)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err);
    }

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Comments.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

commentsRouter.route('/:commentId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Comments.findById(req.params.commentId).populate('author').then((comment)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res,json(comment);
    },(error)=>next(error))
    .catch((error)=>next(error));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /comments/'+ req.params.commentId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=>{
   Comments.findById(req.params.commentId).then((comment)=>{
       if(comment==null){
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.status = 404;
        return next(err);  
       }
       else{
        if(!comment._id.equals(req.params.commentId)){
            var err = new Error('You are not authorized to update this comment!');
            err.status = 403;
            return next(err);
        }
        req.body.author = req.user._id;
        Comments.findByIdAndUpdate(req.params.commentId,{$set : req.body},{new : true})
        .then((comment)=>{
            Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment); 
                })  
            }, (err) => next(err))
       }
   },(error)=>next(error))
   .catch((error)=>next(error));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this comment!');
                err.status = 403;
                return next(err);
            }
            Comments.findByIdAndRemove(req.params.commentId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = commentsRouter;
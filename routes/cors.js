const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3001',
'https://192.168.0.32:3443','http://LAPTOP-V10JRPL7:3001'];
var corsOptionDelegate = (req,callback) =>{
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin'))!==-1){
            corsOptions = { origin : true }; // access control allow origin
        }
    else{
        corsOptions = { origin : false };  // rejected
    }
    callback(null, corsOptions);
}
exports.cors = cors(); // any origin can access resource
exports.corsWithOptions = cors(corsOptionDelegate); // only whitelisted origins can access resource
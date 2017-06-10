/**
 * Created by Jack.L on 2017/6/10.
 */

var crypto = require("crypto");
var express = require('express');
var cookie  = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

module.exports =
    (
        function()
        {
            var app = new express();

            app.use(bodyParser.json());
            app.use(bodyParser.raw());
            app.use(cookie());

            app.use(session(
                {
                    secret:"Jack.L's Server",
                    cookie:{maxAge:600000,httpOnly: true}
                }
            ));

            app.all("*",
                function(req, res, next)
                {
                    ////////
                    res.header("Access-Control-Allow-Origin", req.headers.origin);
                    res.header("Access-Control-Allow-Headers", "Content-Type");
                    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
                    res.header("Access-Control-Allow-Credentials", true);

                    next();
                }
            );

            app.get('/',
                function(req, res)
                {
                    res.send("Welcome To Jack.L's Server");
                }
            );

            app.post('/login',
                function(req, res)
                {
                    ////////

                }
            );

            var instance =
            {
                ////////


            };

            return instance;
        }
    )();


/**
 * Created by Jack.L on 2017/6/10.
 */

var crypto = require("crypto");
var express = require('express');
var cookie  = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var gameSystem = require('./gameSystem');

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
                    gameSystem.login(req, res);
                }
            );

            app.use('/game',
                function(req, res, next)
                {
                    if( gameSystem.checkLogin(req,res) )
                    {
                        next();
                    }
                }
            );

            app.put('/game/nor_mode',
                function(req, res)
                {
                    gameSystem.game_normal(req, res);
                }
            );

            app.put('/game/find_answer',
                function(req, res)
                {
                    gameSystem.game_findAnswer(req, res);
                }
            );

            app.put('/game/com_mode',
                function(req, res)
                {
                    gameSystem.game_competition(req, res);
                }
            );

            app.put('/game/com_mode/next',
                function(req, res)
                {
                    gameSystem.game_competition_next(req, res);
                }
            );

            app.put('/game/com_top',
                function(req, res)
                {
                    gameSystem.game_getTopSort(req, res);
                }
            );



            ////////
            const PORT = 2424;

            var instance =
            {
                ////////
                run:function()
                {
                    var server = app.listen(PORT, function(){
                        var address = server.address();

                        var host = address.address;
                        var port = address.port;

                        console.log('WEB_SERVER＿RUNNING: http://%s:%s', host, port);
                    });
                }


            };

            return instance;
        }
    )();


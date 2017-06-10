/**
 * Created by Jack.L on 2017/6/10.
 */

var game_t2cs = require('./gameTCP2ComServer');

function SEND_MSG(res, data)
{
    var _strValue = JSON.stringify(data);
    res.end(_strValue);
}

module.exports =
    (
        function()
        {
            var instance =
            {
                PLAYERS:{},
                login:function(req, res)
                {
                    var SELF = this;
                    const body = req.body;

                    if( body.uid && typeof body.uid == "string" )
                    {
                        const UID = body.uid;

                        game_t2cs.request_checkLogin(UID,
                            function(data)
                            {
                                var msg = {status:data.status};
                                if( data.status == 402 )
                                {
                                    msg.timeout = data.timeout;
                                }

                                ////////
                                if( data.status == 0 )
                                {
                                    if( !SELF.PLAYERS[UID] )
                                    {
                                        SELF.PLAYERS[UID] = {};
                                    }

                                    SELF.PLAYERS[UID].UID = UID;
                                    SELF.PLAYERS[UID].isVerify = true;
                                    req.session.PLAYER_DATA = SELF.PLAYERS[UID];
                                }

                                SEND_MSG(res, msg);
                                return;
                            }
                        );
                    }
                    else
                    {
                        SEND_MSG(res, {status:-1});
                    }

                },
                checkLogin:function(req, res)
                {
                    var check = false;

                    if( req.session && req.session.PLAYER_DATA && req.session.PLAYER_DATA.isVerify )
                    {
                        check = true;
                    }
                    else
                    {
                        const errorData = {status:1001};
                        SEND_MSG(res, errorData);
                    }

                    return check;
                },
            };

            return instance;
        }
    )();
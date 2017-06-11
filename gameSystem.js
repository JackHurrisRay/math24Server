/**
 * Created by Jack.L on 2017/6/10.
 */

var common = require('./common');
var game_t2cs = require('./gameTCP2ComServer');
const math24Table = require('./math24_table');
const math24TableSize = math24Table.length;

function getRandIndex(count)
{
    var array = [];

    const group_length = Math.floor( math24TableSize / count );

    for( var i = 0; i<count; i++ )
    {
        const index = common.GET_RAND(group_length) + i * group_length;
        array.push(math24Table[index]);
    }

    return array;
}

function randIndexFor4Cells()
{
    const cellGroups =
        [
            ////
            [0,1,2,3],
            [0,1,3,2],
            [0,2,1,3],
            [0,2,3,1],
            [0,3,1,2],
            [0,3,2,1],

            ////
            [1,0,2,3],
            [1,0,3,2],
            [1,2,0,3],
            [1,2,3,0],
            [1,3,0,2],
            [1,3,2,0],

            ////
            [2,1,0,3],
            [2,1,3,0],
            [2,0,1,3],
            [2,0,3,1],
            [2,3,1,0],
            [2,3,0,1],

            ////
            [3,1,2,0],
            [3,1,0,2],
            [3,2,1,0],
            [3,2,0,1],
            [3,0,1,2],
            [3,0,2,1],
        ];

    const length = cellGroups.length;
    const index  = common.GET_RAND(length);
    var _selectGroup = cellGroups[index];

    return _selectGroup;
}

function changeArray4Sort(array)
{
    const randSortIndex = randIndexFor4Cells();

    var new_array = [];
    for( var i in randSortIndex )
    {
        const index = randSortIndex[i];
        new_array.push(array[index]);
    }

    return new_array;
}

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
                                        var PLAYER = SELF.PLAYERS[UID];

                                        //const _NOW = new Date();
                                        //PLAYER.DATE = {YEAR:_NOW.getFullYear(), MONTH:_NOW.getMonth()+1, DAY:_NOW.getDate()};

                                        PLAYER.REFRESH_NEXT_DAY =
                                            function()
                                            {
                                                const _NOW = new Date();
                                                const _DATE = {YEAR:_NOW.getFullYear(), MONTH:_NOW.getMonth()+1, DAY:_NOW.getDate()};

                                                if( PLAYER.DATE && PLAYER.DATE.YEAR == _DATE.YEAR && PLAYER.DATE.MONTH == _DATE.MONTH && PLAYER.DATE.DAY == _DATE.DAY )
                                                {

                                                }
                                                else
                                                {
                                                    ////////
                                                    PLAYER.GOLD = PLAYER.GOLD_MAX;
                                                    PLAYER.DATE = _DATE;
                                                }

                                            };

                                    }

                                    SELF.PLAYERS[UID].UID = UID;
                                    SELF.PLAYERS[UID].isVerify = true;
                                    req.session.PLAYER_DATA = SELF.PLAYERS[UID];
                                }

                                if( data.status != 0 )
                                {
                                    if( SELF.PLAYERS[UID] )
                                    {
                                        delete  SELF.PLAYERS[UID];
                                    }

                                    SEND_MSG(res, msg);
                                }
                                else
                                {
                                    game_t2cs.request_gold(UID,
                                        function(data)
                                        {
                                            if( data.status == 0 )
                                            {
                                                var PLAYER = SELF.PLAYERS[UID];
                                                PLAYER.GOLD_MAX = data.player_diamond;
                                                PLAYER.REFRESH_NEXT_DAY();

                                                msg.GOLD_MAX = PLAYER.GOLD_MAX;
                                                msg.GOLD     = PLAYER.GOLD;

                                            }

                                            SEND_MSG(res, msg);
                                        }
                                    );
                                }

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
                game_normal:function(req, res)
                {
                    var PLAYER = req.session.PLAYER_DATA;
                    var array = getRandIndex(10);
                    PLAYER.QUESTIONS = array;

                    var msg = {};
                    msg.questions = [];
                    msg.status = 0;

                    for( var i in array )
                    {
                        msg.questions.push({parament:array[i].parament});
                    }

                    SEND_MSG(res, msg);
                },
                game_competition:function(req, res)
                {

                },
                game_findAnswer:function(req, res)
                {
                    const requestData = req.body;

                    var PLAYER_SESSION = req.session.PLAYER_DATA;
                    const UID = PLAYER_SESSION.UID;
                    var PLAYER = this.PLAYERS[UID];

                    var msg = {};
                    msg.status = 404;

                    if( PLAYER && PLAYER_SESSION.QUESTIONS && requestData && typeof requestData.question_index == "number")
                    {
                        const questions = PLAYER_SESSION.QUESTIONS;
                        const qIndex = requestData.question_index;

                        if( qIndex >= 0 && qIndex < questions.length )
                        {
                            const question = questions[qIndex];

                            if( PLAYER.GOLD > 0 )
                            {
                                PLAYER.GOLD -= 1;

                                msg.answer = question["result"];
                                msg.GOLD   = PLAYER.GOLD;

                                msg.status = 0;
                            }
                            else
                            {
                                msg.status = 402;
                            }

                        }
                        else
                        {
                            msg.status = 401;
                        }

                    }

                    SEND_MSG(res, msg);
                }
            };

            return instance;
        }
    )();
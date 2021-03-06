/**
 * Created by Jack.L on 2017/6/10.
 */

var common = require('./common');
var game_t2cs = require('./gameTCP2ComServer');
var player_stratage = require('./playerStratage');

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
                PLAYERS_DATA_STORE:new player_stratage.player_data(),
                PLAYERS_TOP_SORT:[null, null, null, null],
                init:function()
                {
                    var SELF = this;

                    this.PLAYERS_DATA_STORE.load(
                        function(data)
                        {
                            for( var key in data )
                            {
                                var _child = data[key];

                                if( _child.UID == key )
                                {
                                    SELF.PLAYERS[key] = _child;
                                }
                            }

                            console.log('load the player data');
                        }
                    );

                    this.PLAYERS_TOP_SORT[0] = new player_stratage.players_sort();
                    this.PLAYERS_TOP_SORT[1] = new player_stratage.players_sort();
                    this.PLAYERS_TOP_SORT[2] = new player_stratage.players_sort();
                    this.PLAYERS_TOP_SORT[3] = new player_stratage.players_sort();

                    this.PLAYERS_TOP_SORT[0].load('./data/v1');
                    this.PLAYERS_TOP_SORT[1].load('./data/v2');
                    this.PLAYERS_TOP_SORT[2].load('./data/v3');
                    this.PLAYERS_TOP_SORT[3].load('./data/v4');
                },
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

                                    var PLAYER = SELF.PLAYERS[UID];

                                    PLAYER.UID = UID;
                                    PLAYER.isVerify   = true;
                                    PLAYER.INVITER_ID = null;

                                    ////////
                                    req.session.PLAYER_DATA = SELF.PLAYERS[UID];

                                    if( PLAYER && !PLAYER.REFRESH_NEXT_DAY )
                                    {
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

                                                ////////
                                                //check store data
                                                var _storePlayerData = SELF.PLAYERS_DATA_STORE.getPlayer(UID);
                                                if( _storePlayerData )
                                                {
                                                    PLAYER.GOLD = _storePlayerData.GOLD;
                                                    PLAYER.DATE = _storePlayerData.DATE;
                                                    PLAYER.COMPETITION_TIMES = _storePlayerData.COMPETITION_TIMES;
                                                    PLAYER.RECORD_COM_TOP    = _storePlayerData.RECORD_COM_TOP;

                                                    ////////
                                                    const _inviter_date = body.inviter_datecheck;

                                                    if( _inviter_date && typeof _inviter_date == "number" && body.inviter_id != UID )
                                                    {
                                                        //check date time out
                                                        var _now = (new Date()).getTime();
                                                        var _last = _now - _inviter_date;

                                                        if( _last < 1000 * 60 * 60 * 12 )
                                                        {
                                                            PLAYER.INVITER_ID = body.inviter;
                                                        }
                                                    }
                                                }

                                                ////////
                                                msg.GOLD_MAX = PLAYER.GOLD_MAX;
                                                msg.GOLD     = PLAYER.GOLD;

                                                if( PLAYER.GOLD_FROM && PLAYER.GOLD_FROM.length > 0 )
                                                {
                                                    //check without self
                                                    var _tempGOLD_FROM = [];
                                                    for( var i in  PLAYER.GOLD_FROM )
                                                    {
                                                        var obj = PLAYER.GOLD_FROM[i];

                                                        if( obj != UID )
                                                        {
                                                            _tempGOLD_FROM.push(obj);
                                                        }
                                                    }

                                                    if( _tempGOLD_FROM.length != PLAYER.GOLD_FROM.length )
                                                    {
                                                        PLAYER.GOLD_FROM = _tempGOLD_FROM;
                                                    }

                                                    if( PLAYER.GOLD_FROM.length > 0 )
                                                    {
                                                        msg.GOLD_FROM = PLAYER.GOLD_FROM;
                                                    }
                                                }

                                                PLAYER.REFRESH_NEXT_DAY();
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
                    var PLAYER_SESSION = req.session.PLAYER_DATA;
                    var array = getRandIndex(10);
                    PLAYER_SESSION.QUESTIONS = array;

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
                    ////////
                    var msg = {};
                    msg.status = 400;


                    var PLAYER_SESSION = req.session.PLAYER_DATA;
                    const UID = PLAYER_SESSION.UID;
                    var PLAYER = this.PLAYERS[UID];

                    if( PLAYER && PLAYER_SESSION )
                    {
                        if( PLAYER.GOLD > 0 )
                        {
                            PLAYER.GOLD -= 1;

                            ////////
                            this.PLAYERS_DATA_STORE.saveData(UID, PLAYER);

                            ////////
                            //create questions
                            const MAX_COMPETITION = 10;

                            PLAYER_SESSION.COMPETITION_KEY   = (new Date()).getTime().toString();
                            PLAYER_SESSION.COMPETITION_INDEX = 0;
                            PLAYER_SESSION.COMPETITION_MAX   = MAX_COMPETITION;
                            PLAYER.COMPETITION_PLAYERRECORD = new player_stratage.player_record();

                            var _questionArray = [];
                            for( var i in math24Table )
                            {
                                var _obj = common.extendDeep( math24Table[i] );
                                _obj.index = i;

                                _questionArray.push(_obj);
                            }

                            var _questionSelectArray = [];

                            while( _questionSelectArray.length < MAX_COMPETITION )
                            {
                                for( var i in _questionArray )
                                {
                                    var _obj = _questionArray[i];

                                    if( common.GET_RAND(_questionArray.length) < MAX_COMPETITION )
                                    {
                                        _questionArray.splice(i, 1);
                                        _questionSelectArray.push(_obj);
                                        break;
                                    }
                                }
                            }

                            PLAYER_SESSION.QUESTIONS = _questionSelectArray;

                            ////////
                            //msg.questions = _questionSelectArray;
                            const _questionCur = PLAYER_SESSION.QUESTIONS[PLAYER_SESSION.COMPETITION_INDEX];
                            msg.question       = common.KEY_MATH.encrypt(JSON.stringify(_questionCur), PLAYER_SESSION.COMPETITION_KEY);

                            msg.question_max   = MAX_COMPETITION;
                            msg.question_index = PLAYER_SESSION.COMPETITION_INDEX;

                            msg.question_key   = common.KEY_MATH.encrypt(PLAYER_SESSION.COMPETITION_KEY, UID);

                            ////////
                            //check time
                            PLAYER_SESSION.COMPETITION_STARTTIME = (new Date()).getTime();

                            ////////
                            msg.GOLD = PLAYER.GOLD;
                            msg.status = 0;

                            ////////
                            PLAYER_SESSION.COMPETITION_INDEX += 1;
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

                    SEND_MSG(res, msg);
                },
                game_competition_next:function(req, res)
                {
                    var msg = {};
                    msg.status = 400;

                    var PLAYER_SESSION = req.session.PLAYER_DATA;
                    const UID = PLAYER_SESSION.UID;
                    var PLAYER = this.PLAYERS[UID];

                    const data = req.body;

                    if( PLAYER && PLAYER_SESSION && data && data.key )
                    {
                        const _sourceKey = data.key;
                        var _keyValue = null;

                        try
                        {
                            _keyValue = common.KEY_MATH.decrypt(_sourceKey, PLAYER_SESSION.COMPETITION_KEY);
                        }
                        catch(e)
                        {

                        }

                        if( _keyValue && typeof _keyValue == "string" && _keyValue == UID && PLAYER_SESSION.QUESTIONS )
                        {
                            var _timecheckData = {last:(new Date()).getTime() - PLAYER_SESSION.COMPETITION_STARTTIME};
                            PLAYER_SESSION.COMPETITION_STARTTIME = (new Date()).getTime();
                            PLAYER.COMPETITION_PLAYERRECORD.push_data(_timecheckData);

                            if( PLAYER_SESSION.COMPETITION_INDEX < PLAYER_SESSION.COMPETITION_MAX )
                            {
                                //next question
                                PLAYER_SESSION.COMPETITION_KEY   = (new Date()).getTime().toString();

                                const _questionCur = PLAYER_SESSION.QUESTIONS[PLAYER_SESSION.COMPETITION_INDEX];
                                msg.question       = common.KEY_MATH.encrypt(JSON.stringify(_questionCur), PLAYER_SESSION.COMPETITION_KEY);
                                msg.question_index = PLAYER_SESSION.COMPETITION_INDEX;

                                msg.question_key   = common.KEY_MATH.encrypt(PLAYER_SESSION.COMPETITION_KEY, UID);
                            }
                            else
                            {
                                ////
                                //result and computer the record
                                const result =
                                {
                                    v1:PLAYER.COMPETITION_PLAYERRECORD.computerAv1(),
                                    v2:PLAYER.COMPETITION_PLAYERRECORD.computerAv2(),
                                    v3:PLAYER.COMPETITION_PLAYERRECORD.computerAv3(),
                                    v4:PLAYER.COMPETITION_PLAYERRECORD.computerAv4(),
                                };

                                this.PLAYERS_TOP_SORT[0].push_data(UID, result.v1);
                                this.PLAYERS_TOP_SORT[1].push_data(UID, result.v2);
                                this.PLAYERS_TOP_SORT[2].push_data(UID, result.v3);
                                this.PLAYERS_TOP_SORT[3].push_data(UID, result.v4);

                                ////////
                                //get the top result
                                msg.competition_result = result;

                                if( !PLAYER.COMPETITION_TIMES )
                                {
                                    PLAYER.COMPETITION_TIMES = 1;
                                }
                                else
                                {
                                    PLAYER.COMPETITION_TIMES += 1;
                                }

                                this.PLAYERS_DATA_STORE.saveData(UID, PLAYER);

                                ////////
                                if( PLAYER.INVITER_ID && this.PLAYERS[PLAYER.INVITER_ID] )
                                {
                                    var _inviter = this.PLAYERS[PLAYER.INVITER_ID];

                                    if( !_inviter.GOLD_FROM )
                                    {
                                        _inviter.GOLD_FROM = [];
                                    }

                                    var checkNoExist = true;

                                    for( var i in _inviter.GOLD_FROM )
                                    {
                                        if(_inviter.GOLD_FROM[i] == PLAYER.UID )
                                        {
                                            checkNoExist = false;
                                            break;
                                        }
                                    }

                                    if( checkNoExist )
                                    {
                                        _inviter.GOLD_FROM.push(PLAYER.UID);
                                    }
                                }

                            }

                            ////////
                            msg.status = 0;

                            ////////
                            PLAYER_SESSION.COMPETITION_INDEX += 1;
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

                    SEND_MSG(res, msg);
                },
                game_getTopSort:function(req, res)
                {
                    var PLAYER_SESSION = req.session.PLAYER_DATA;
                    const UID = PLAYER_SESSION.UID;
                    var PLAYER = this.PLAYERS[UID];

                    var msg = {};
                    msg.status = 400;

                    if( PLAYER && PLAYER_SESSION && PLAYER.COMPETITION_TIMES )
                    {
                        var _topSort =
                        [
                            parseInt(this.PLAYERS_TOP_SORT[0].getTopIndex(UID)),
                            parseInt(this.PLAYERS_TOP_SORT[1].getTopIndex(UID)),
                            parseInt(this.PLAYERS_TOP_SORT[2].getTopIndex(UID)),
                            parseInt(this.PLAYERS_TOP_SORT[3].getTopIndex(UID))
                        ];

                        if( PLAYER.COMPETITION_TIMES < 10 )
                        {
                            for( var i in _topSort )
                            {
                                _topSort[i] = 4999 + common.GET_RAND(100) + _topSort[i] * 400 - PLAYER.COMPETITION_TIMES * 10;
                            }
                        }
                        else if( PLAYER.COMPETITION_TIMES < 100 )
                        {
                            for( var i in _topSort )
                            {
                                _topSort[i] = 3999 + common.GET_RAND(80) + _topSort[i] * 200 - PLAYER.COMPETITION_TIMES * 8;
                            }
                        }
                        else if( PLAYER.COMPETITION_TIMES < 200 )
                        {
                            for( var i in _topSort )
                            {
                                _topSort[i] = 2999 + common.GET_RAND(60) + _topSort[i] * 100 - PLAYER.COMPETITION_TIMES * 4;
                            }
                        }
                        else if( PLAYER.COMPETITION_TIMES < 300 )
                        {
                            for( var i in _topSort )
                            {
                                _topSort[i] = 1999 + common.GET_RAND(40) + _topSort[i] * 80 - PLAYER.COMPETITION_TIMES * 2;
                            }
                        }
                        else if( PLAYER.COMPETITION_TIMES < 400 )
                        {
                            for( var i in _topSort )
                            {
                                _topSort[i] = 999 + common.GET_RAND(20) + _topSort[i] * 40 - PLAYER.COMPETITION_TIMES;
                            }
                        }
                        else if( PLAYER.COMPETITION_TIMES < 500 )
                        {
                            for( var i in _topSort )
                            {
                                _topSort[i] = 299 + common.GET_RAND(10) + _topSort[i] * 20 - PLAYER.COMPETITION_TIMES/2;
                            }
                        }

                        msg.top_result = _topSort;
                        msg.competition_times = PLAYER.COMPETITION_TIMES;

                        msg.status = 0;

                        ////////
                        PLAYER.RECORD_COM_TOP = _topSort;

                    }
                    else
                    {
                        msg.status = 401;
                    }

                    SEND_MSG(res, msg);
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

                                ////////
                                this.PLAYERS_DATA_STORE.saveData(UID, PLAYER);

                                ////////
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
                },
                game_gold_from:function(req, res)
                {
                    var PLAYER_SESSION = req.session.PLAYER_DATA;
                    const UID = PLAYER_SESSION.UID;
                    var PLAYER = this.PLAYERS[UID];

                    var msg = {};
                    msg.status = 400;

                    if( PLAYER && PLAYER_SESSION && PLAYER.GOLD_FROM && PLAYER.GOLD_FROM.length > 0 )
                    {
                        if( PLAYER.GOLD < PLAYER.GOLD_MAX )
                        {
                            const GOLD_OLD = PLAYER.GOLD;

                            PLAYER.GOLD += PLAYER.GOLD_FROM.length;

                            if( PLAYER.GOLD > PLAYER.GOLD_MAX )
                            {
                                PLAYER.GOLD = PLAYER.GOLD_MAX;
                            }

                            msg.GOLD     = PLAYER.GOLD;
                            msg.GOLD_ADD = PLAYER.GOLD - GOLD_OLD;
                            msg.status = 0;

                            PLAYER.GOLD_FROM = [];
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

                    SEND_MSG(res, msg);
                }
            };

            instance.init();
            return instance;
        }
    )();
/**
 * Created by Jack.L on 2017/6/11.
 */

var filesys = require('./fileSystem');
var common  = require('./common');

module.exports =
{
    player_record:function()
    {
        var object =
        {
            GAME_RECORD:[],
            push_data:function(data)
            {
                if( data && data.last )
                {
                    this.GAME_RECORD.push(data);
                }
            },
            computerAv1:function()
            {
                const count = 1.0 * this.GAME_RECORD.length;

                var result = 0;
                for( var i in this.GAME_RECORD )
                {
                    result += this.GAME_RECORD[i].last;
                }

                result = result / count;

                const _result = Math.floor(result)
                return _result;

            },
            computerAv2:function()
            {
                const count = 1.0 * this.GAME_RECORD.length;

                var array = [];
                for( var i in this.GAME_RECORD )
                {
                    array.push(this.GAME_RECORD[i].last);
                }

                array.sort();

                var result = 0;
                for( var i in array )
                {
                    if( i != 0 && i != count - 1 )
                    {
                        result += array[i];
                    }
                }

                result = result / (count - 2);

                const _result = Math.floor(result)
                return _result;
            },
            computerAv3:function()
            {
                var result = 0;
                for( var i in this.GAME_RECORD )
                {
                    result += this.GAME_RECORD[i].last * this.GAME_RECORD[i].last;
                }

                result = Math.sqrt( result );

                const _result = Math.floor(result)
                return _result;

            },
            computerAv4:function()
            {
                const count = 1.0 * this.GAME_RECORD.length;

                var result = 0;
                for( var i in this.GAME_RECORD )
                {
                    result += this.GAME_RECORD[i].last * this.GAME_RECORD[i].last;
                }

                result = result / count;
                result = Math.sqrt( result );

                const _result = Math.floor(result)
                return _result;

            },
        };

        return object;

    },
    player_data:function()
    {
        var object =
        {
            DATA:{},
            FILE_PATH:"./data/players",
            TIMER:new common.GameTimer(),
            COUNT_REF:0,
            IS_SAVING:false,
            load:function(callback)
            {
                var SELF = this;

                filesys.load(this.FILE_PATH,
                    function(data)
                    {
                        ////////
                        SELF.DATA = data;
                        callback(data);

                        ////////
                        SELF.TIMER.init(
                            1000,
                            function()
                            {
                                if( SELF.COUNT_REF > 0 && !SELF.IS_SAVING )
                                {
                                    SELF.IS_SAVING = true;
                                    SELF.save();
                                }
                            }
                        );

                    }
                );

            },
            save:function()
            {
                var SELF = this;

                filesys.save(this.FILE_PATH, this.DATA,
                    function(err)
                    {
                        if( err )
                        {

                        }
                        else
                        {

                        }

                        SELF.IS_SAVING = false;
                        SELF.COUNT_REF = 0;
                    }
                );
            },
            saveData:function(uid, player_data)
            {
                this.DATA[uid] =
                {
                    UID:player_data.UID,
                    GOLD:player_data.GOLD,
                    DATE:player_data.DATE,
                    COMPETITION_TIMES:player_data.COMPETITION_TIMES
                };

                this.COUNT_REF += 1;
            },
            getPlayer:function(uid)
            {
                return this.DATA[uid];
            }
        };

        return object;
    },
    players_sort:function()
    {
        ////////
        var object =
        {
            ////////
            SORT_ARRAY:[],//cell {player_id:xxx, time:xxx}
            FILE_PATH:"",
            TIMER:new common.GameTimer(),
            COUNT_REF:0,
            IS_SAVING:false,
            IS_PUSHING:0,
            load:function(filename)
            {
                this.FILE_PATH = filename;

                var SELF = this;
                filesys.load(this.FILE_PATH,
                    function(data)
                    {
                        ////////
                        for( var i in data )
                        {
                            SELF.SORT_ARRAY.push(data[i]);
                        }

                        ////////
                        SELF.TIMER.init(
                            1000,
                            function()
                            {
                                if( SELF.COUNT_REF > 0 && !SELF.IS_SAVING && SELF.IS_PUSHING == 0 )
                                {
                                    SELF.IS_SAVING = true;
                                    SELF.sort();
                                    SELF.save();
                                }
                            }
                        );


                    }
                );

            },
            save:function()
            {
                var SELF = this;

                filesys.save(this.FILE_PATH, this.SORT_ARRAY,
                    function(err)
                    {
                        SELF.IS_SAVING = false;
                        SELF.COUNT_REF = 0;
                    }
                );
            },
            push_data:function(player_id, time)
            {
                this.IS_PUSHING += 1;

                var _sortIndex = -1;
                var object = null;
                for( var i in this.SORT_ARRAY )
                {
                    var _obj = this.SORT_ARRAY[i];

                    if( _obj.player_id == player_id )
                    {
                        object = _obj;
                        _sortIndex = i;
                        break;
                    }
                }

                var _needSort = true;

                if( object )
                {
                    /*
                    if( object.time > time )
                    {
                        object.time = time;
                    }
                    else
                    {
                        _needSort = false;
                    }
                    */

                    object.time = ( object.time + time ) / 2.0;

                }
                else
                {
                    this.SORT_ARRAY.push({player_id:player_id, time:time});
                }

                if( _needSort )
                {
                    ////
                    this.COUNT_REF += 1;
                }

                this.IS_PUSHING -= 1;

                return _needSort;
            },
            getTopIndex:function(UID)
            {
                var _sortIndex = -1;
                for( var i in this.SORT_ARRAY )
                {
                    var _obj = this.SORT_ARRAY[i];

                    if( _obj.player_id == UID )
                    {
                        _sortIndex = i;
                        break;
                    }
                }

                return _sortIndex;
            },
            sort:function()
            {
                this.SORT_ARRAY.sort(
                    function(a, b)
                    {
                        return a.time > b.time;
                    }
                );
            }


        };

        return object;

    }

};


/**
 * Created by Jack.L on 2017/6/10.
 */

const ENUM_MSG_TYPE =
{
    ////
    "ENUM_C2S_CHECK_LOGIN":2000,
    "ENUM_S2C_CHECK_LOGIN":2001,

    ////
    "ENUM_C2S_HEART":2010,
    "ENUM_S2C_HEART":2015,

    ////
    "ENUM_C2S_CONNECT":1000,
    "ENUM_C2S_REQUEST_GOLD":1001,
    "ENUM_C2S_COST_GOLD":1002,
    "ENUM_C2S_RESULT_RECORD":1010,

    ////
    "ENUM_S2C_CONNECT":2000,
    "ENUM_S2C_REQUEST_GOLD":2001,
    "ENUM_S2C_COST_GOLD":2002,
    "ENUM_S2C_RESULT_RECORD":1011,
};

const ENUM_COM_RESULT_STATUS =
{
    "S_OK":0,
    "error_unknown":255,
    "error_noprotocal":100,
    "error_nodata":101,
    "error_notenough":102,
};

const protocal_c2s =
{
    "MSG_C2S_HEART":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_HEART,
    },
    "MSG_C2S_CONNECT":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_CONNECT,
        "COM SERVER":"Jack.L's Server",
        "content_id":0
    },
    "MSG_C2S_CHECKLOGIN":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_CHECK_LOGIN,
        "player_id":0
    },
    "MSG_C2S_REQUEST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_REQUEST_GOLD,
        "content_id":0,
        "player_id":0
    },
    "MSG_C2S_COST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_COST_GOLD,
        "content_id":0,
        "player_id":0,
        "player_diamond":0
    },
    "MSG_C2S_RESULT_RECORD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_C2S_RESULT_RECORD,
        "result":""
    }
};

const protocal_s2c =
{
    "MSG_S2C_HEART":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_HEART,
    },
    "MSG_S2C_CONNECT":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_CONNECT,
        "status":0
    },
    "MSG_S2C_CHECKLOGIN":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_CHECK_LOGIN,
        "status":0
    },
    "MSG_S2C_REQUEST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_REQUEST_GOLD,
        "status":0,
        "player_id":0,
        "player_diamond":0
    },
    "MSG_S2C_COST_GOLD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_COST_GOLD,
        "status":0,
        "player_id":0,
        "player_diamond":0
    },
    "MSG_S2C_RESULT_RECORD":
    {
        "protocal":ENUM_MSG_TYPE.ENUM_S2C_RESULT_RECORD,
        "status":0
    },
    "MSG_S2C_ERROR":
    {
        "protocal":0,
        "status":ENUM_COM_RESULT_STATUS.error_unknown
    },
};

var net = require('net');

var base64 = require('./base64');
var common = require('./common');

const port = 0628;
const host = "47.92.88.155";
const content_id = "1497106073695715";

const retryTimeout = 3000;
module.exports =
    (
        function()
        {
            var instance =
            {
                ////////
                isConn:false,
                conn:null,
                MSG_QUEUE:[],
                CALLBACK:null,
                run:function()
                {
                    this.connect();
                },
                sendMsg:function(msg, callback)//send logic
                {
                    if( this.isConn && this.CALLBACK == null )
                    {
                        this.CALLBACK = callback;
                        this._sendMsg(msg);
                    }
                    else
                    {
                        this._pushMsg(msg);
                    }
                },
                _pushMsg:function(msg, callback)
                {
                    var _msgStr = JSON.stringify(msg);
                    var _msg = base64.encoder(_msgStr);

                    var _PUSH_DATA =
                    {
                        data:_msg,
                        callback:callback
                    };

                    this.MSG_QUEUE.push(_PUSH_DATA);
                },
                _sendMsg:function(msg)//send origin
                {
                    var _msgStr = JSON.stringify(msg);
                    var _msg = base64.encoder(_msgStr);
                    this.conn.write(_msg);
                },
                connect:function()
                {
                    var SELF = this;

                    this.conn = new net.Socket();
                    this.conn.setEncoding('binary');

                    this.conn.connect(port, host,
                        function()
                        {
                            SELF.isConn = true;
                            console.log('socket connected to ComServer');

                            ////////
                            var msg = common.extendDeep(protocal_c2s.MSG_C2S_CONNECT);
                            msg.content_id = content_id;

                            SELF._sendMsg(msg);
                        }
                    );

                    this.conn.on('data',
                        function(data)
                        {
                            SELF.onRecv(data);
                        }
                    );

                    this.conn.on('error',
                        function(error)
                        {

                        }
                    );

                    this.conn.on('close',
                        function()
                        {
                            ////////
                            //re connect
                            console.log('socket closed and will be connected soom');
                            SELF.isConn = false;

                            setTimeout(
                                function()
                                {
                                    SELF.connect();
                                },
                                retryTimeout
                            );

                        }
                    );
                },
                onRecv:function(data)
                {
                    if( this.isConn )
                    {
                        var _object = null;

                        try
                        {
                            var _resultString = data.toString('utf8');
                            var _parseString = base64.transAscToStringArray( base64.decoder(_resultString) );

                            _object = JSON.parse(_parseString);
                        }
                        catch(e)
                        {

                        }

                        if( _object && _object.protocal )
                        {
                            this.onProcess(_object);
                        }
                    }
                },
                onProcess:function(object)
                {
                    switch (object.protocal)
                    {
                        case ENUM_MSG_TYPE.ENUM_S2C_CONNECT:
                        {
                            if( object.status == 0 )
                            {
                                console.log('connect to ComServer successfully');
                            }
                            else
                            {
                                this.conn.end();
                            }

                            break;
                        }
                        default:
                        {
                            if( this.CALLBACK )
                            {
                                this.CALLBACK(object);
                                this.CALLBACK = null;
                            }

                            if( this.MSG_QUEUE.length > 0 )
                            {
                                var _msgData = this.MSG_QUEUE.pop();
                                this.sendMsg(_msgData.data, _msgData.callback);
                            }

                            break;
                        }
                    }
                },
                request_checkLogin:function(player_uid, callback)
                {
                    var msg = common.extendDeep( protocal_c2s.MSG_C2S_CHECKLOGIN );
                    msg.player_id = player_uid;

                    this.sendMsg(msg, callback);
                },
                request_gold:function(player_uid, callback)
                {
                    var msg = common.extendDeep( protocal_c2s.MSG_C2S_REQUEST_GOLD );
                    msg.content_id = content_id;
                    msg.player_id = player_uid;

                    this.sendMsg(msg, callback);
                }
            };

            return instance;
        }
    )();


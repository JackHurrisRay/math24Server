/**
 * Created by Jack.L on 2017/6/13.
 */

module.exports =
    (
        function()
        {
            var instance =
            {
                ////////
                PLAYERS:{},
                load:function()
                {

                },
                save:function()
                {

                },
                setPlayer:function(UID)
                {
                    if( !this.PLAYERS[UID] )
                    {
                        this.PLAYERS[UID] = {};
                        this.PLAYERS[UID].UID = UID;
                        this.PLAYERS[UID].inviter_pool = [];
                    }

                    return this.PLAYERS[UID];
                },
                getInviterPool:function(UID)
                {
                    var _pool = null;

                    var player = this.PLAYERS[UID];

                    if( player )
                    {
                        _pool = player.inviter_pool;
                    }

                    return _pool;
                },
                pushInviter:function(UID,inviter_id)
                {
                    var selfplayer = this.setPlayer(UID);
                    var inviter    = this.setPlayer(inviter_id);

                    var _checkNoExist = true;

                    for( var i in inviter.inviter_pool )
                    {
                        var checkid = inviter.inviter_pool[i];

                        if( checkid == UID )
                        {
                            _checkExist = false;
                            break;
                        }
                    }

                    if( _checkNoExist )
                    {
                        inviter.inviter_pool.push(UID);
                    }
                }
            };

            return instance;
        }
    )();
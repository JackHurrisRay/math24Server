/**
 * Created by Jack.L on 2017/6/11.
 */

var fs = require('fs');

module.exports =
    (
        function()
        {
            var instance =
            {
                save:function(file, data, callback)
                {
                    var _strData = JSON.stringify(data);
                    fs.writeFile(file, _strData,
                        function(err)
                        {
                            if( err )
                            {
                                console.log('failed to save file:'+file.toString());
                            }
                            else
                            {
                                console.log('success to save file:'+file.toString());
                                callback();
                            }
                        }
                    );
                },
                load:function(file, callback)
                {
                    var _callback_loadfile =
                        function(file)
                        {
                            fs.readFile(file, 'utf8',
                                function(err, data)
                                {
                                    if( err )
                                    {
                                        console.log('failed to load file:'+file.toString());
                                    }
                                    else
                                    {
                                        console.log('success to load file:'+file.toString());

                                        var object = null;

                                        try
                                        {
                                            object = JSON.parse(data);
                                        }
                                        catch (e)
                                        {

                                        }

                                        if( object )
                                        {
                                            callback(object);
                                        }
                                    }
                                }
                            );
                        };

                    ////////
                    fs.exists(file,
                        function(exist)
                        {
                            if( !exist )
                            {
                                fs.open(file, 'w',
                                    function(err, fd)
                                    {
                                        if( err )
                                        {
                                            throw err;
                                        }
                                        else
                                        {
                                            fs.write(fd, "", 0,0,0,
                                                function(err)
                                                {
                                                    if( err )
                                                    {
                                                        throw err;
                                                    }
                                                    else
                                                    {
                                                        _callback_loadfile(file);
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                            else
                            {
                                _callback_loadfile(file);
                            }
                        }
                    );

                }
            };

            return instance;
        }
    )();


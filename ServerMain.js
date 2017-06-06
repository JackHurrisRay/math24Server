/**
 * Created by Jack.L on 2017/6/6.
 */

/*
var fs = require('fs');
var writestream = require('lei-stream').writeLine;
var math24 = require('./Math24');

const filename = './math24_table.js';

var s = writestream(fs.createWriteStream(filename),
    {
        newline:'\n',
        encoding:function(data)
        {
            if( typeof data == 'string')
            {
                return data;
            }
            else
            {
                return JSON.stringify(data);
            }
        },
        cacheLines:0
    }
);

s.write("const MATH24_TABLE = [");
math24.createMath24Table(s);
s.write("];");
s.end();
*/

var gameServer = require('./gameServer');
gameServer.run();
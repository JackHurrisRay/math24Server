/**
 * Created by Jack.L on 2017/5/1.
 */

var $       = require('jquery');
var http    = require('http');
var fs      = require('fs');
var request = require('request');

module.exports =
{
    extendDeep:function(parent, child)
    {
        child = child || {};
        for(var i in parent)
        {
            if(parent.hasOwnProperty(i))
            {
                //检测当前属性是否为对象
                if(typeof parent[i] === "object")
                {
                    //如果当前属性为对象，还要检测它是否为数组
                    //这是因为数组的字面量表示和对象的字面量表示不同
                    //前者是[],而后者是{}
                    child[i] = (Object.prototype.toString.call(parent[i]) === "[object Array]") ? [] : {};

                    //递归调用extend
                    this.extendDeep(parent[i], child[i]);
                }
                else
                {
                    child[i] = parent[i];
                }

            }
        }
        return child;
    },
    checkURLInvalid:function(url)
    {
        function checkURL(URL){
            var str=URL;
            //判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
            //下面的代码中应用了转义字符"\"输出一个字符"/"
            var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
            var objExp=new RegExp(Expression);
            if(objExp.test(str)==true){
                return true;
            }else{
                return false;
            }
        }

        return checkURL(url);
    },
    getImageFromURL:function(url, callback)
    {
        var img_data = "";

        try
        {
            http.get(
                url,
                function(res)
                {
                    res.setEncoding('base64');

                    res.on('data',
                        function(data)
                        {
                            img_data += data;
                        }
                    );

                    res.on('end',
                        function()
                        {
                            callback(img_data, null);
                        }
                    );

                    res.on('error',
                        function(err)
                        {
                            callback(null, err);
                        }
                    );

                }
            );
        }
        catch (e)
        {
            callback(null, e);
            throw e;
        }


    },
    GET_RAND:function(max)
    {
        var   value1 = Math.random() * 1000000 + (new Date()).getTime();
        const value2 = Math.floor(value1);

        return value2 % max;
    },
    KEY_MATH:
    {
        encrypt:function (str, pwd) {
            if(pwd == null || pwd.length <= 0) {
                alert("Please enter a password with which to encrypt the message.");
                return null;
            }
            var prand = "";
            for(var i=0; i<pwd.length; i++) {
                prand += pwd.charCodeAt(i).toString();
            }
            var sPos = Math.floor(prand.length / 5);
            var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
            var incr = Math.ceil(pwd.length / 2);
            var modu = Math.pow(2, 31) - 1;
            if(mult < 2) {
                alert("Algorithm cannot find a suitable hash. Please choose a different password. \nPossible considerations are to choose a more complex or longer password.");
                return null;
            }
            var salt = Math.round(Math.random() * 1000000000) % 100000000;
            prand += salt;
            while(prand.length > 10) {
                prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
            }
            prand = (mult * prand + incr) % modu;
            var enc_chr = "";
            var enc_str = "";
            for(var i=0; i<str.length; i++) {
                enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255));
                if(enc_chr < 16) {
                    enc_str += "0" + enc_chr.toString(16);
                } else enc_str += enc_chr.toString(16);
                prand = (mult * prand + incr) % modu;
            }
            salt = salt.toString(16);
            while(salt.length < 8)salt = "0" + salt;
            enc_str += salt;
            return enc_str;
        },
        decrypt:function(str, pwd) {
            if(str == null || str.length < 8) {
                alert("A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted.");
                return;
            }
            if(pwd == null || pwd.length <= 0) {
                alert("Please enter a password with which to decrypt the message.");
                return;
            }
            var prand = "";
            for(var i=0; i<pwd.length; i++) {
                prand += pwd.charCodeAt(i).toString();
            }
            var sPos = Math.floor(prand.length / 5);
            var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
            var incr = Math.round(pwd.length / 2);
            var modu = Math.pow(2, 31) - 1;
            var salt = parseInt(str.substring(str.length - 8, str.length), 16);
            str = str.substring(0, str.length - 8);
            prand += salt;
            while(prand.length > 10) {
                prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
            }
            prand = (mult * prand + incr) % modu;
            var enc_chr = "";
            var enc_str = "";
            for(var i=0; i<str.length; i+=2) {
                enc_chr = parseInt(parseInt(str.substring(i, i+2), 16) ^ Math.floor((prand / modu) * 255));
                enc_str += String.fromCharCode(enc_chr);
                prand = (mult * prand + incr) % modu;
            }
            return enc_str;
        }
    },
    GameTimer:function()
    {
        var object =
        {
            CALLBACK:null,
            TIME_LAST:0,
            init:function(msecond, callback)
            {
                this.TIME_LAST = msecond;
                this.CALLBACK = callback;

                this.update();
            },
            update:function()
            {
                var SELF = this;

                setTimeout(
                    function()
                    {
                        if( SELF.CALLBACK )
                        {
                            SELF.CALLBACK();
                        }

                        SELF.update();
                    },
                    SELF.TIME_LAST
                );
            }
        };

        return object;
    }
};
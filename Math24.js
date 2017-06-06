/**
 * Created by Jack.L on 2017/6/6.
 */

var Math24Method =
    (
        function()
        {
            const OPERATOR = ["+","-","*","/"];

            function take_1(n1,n2,n3,n4, o1, o2, o3)
            {
                var value = n1.toString() + o1.toString() + n2.toString() + o2.toString() + n3.toString() + o3.toString() + n4.toString();
                return value;
            };

            function take_2(n1,n2,n3,n4, o1, o2, o3)
            {
                var value = "(" + n1.toString() + o1.toString() + n2.toString() + ")" + o2.toString() + n3.toString() + o3.toString() + n4.toString();
                return value;
            };

            function take_3(n1,n2,n3,n4, o1, o2, o3)
            {
                var value = "(" + n1.toString() + o1.toString() + n2.toString() + o2.toString() + n3.toString() + ")" + o3.toString() + n4.toString();
                return value;
            };

            function take_4(n1,n2,n3,n4, o1, o2, o3)
            {
                var value = n1.toString() + o1.toString() + "(" + n2.toString() + o2.toString() + n3.toString() + ")" + o3.toString() + n4.toString();
                return value;
            };

            function take_5(n1,n2,n3,n4, o1, o2, o3)
            {
                var value = n1.toString() + o1.toString() + "(" + n2.toString() + o2.toString() + n3.toString() + o3.toString() + n4.toString() + ")";
                return value;
            };

            function take_6(n1,n2,n3,n4, o1, o2, o3)
            {
                var value = n1.toString() + o1.toString() + n2.toString() + o2.toString() + "(" + n3.toString() + o3.toString() + n4.toString() + ")";
                return value;
            };

            function take_7(n1,n2,n3,n4, o1, o2, o3)
            {
                var value = "(" + n1.toString() + o1.toString() + n2.toString() + ")" + o2.toString() + "(" + n3.toString() + o3.toString() + n4.toString() + ")";
                return value;
            };

            var TAKE_SENTENCE =
                [
                    take_1, take_2, take_3, take_4, take_5, take_6, take_7
                ];

            var take_sentence_once =
                function(n1,n2,n3,n4)
                {
                    for( var a=0; a<4; a++ )
                    {
                        for( var b=0; b<4; b++ )
                        {
                            for( var c=0; c<4; c++ )
                            {
                                const _operator = [OPERATOR[a], OPERATOR[b], OPERATOR[c]];

                                for( var i in TAKE_SENTENCE )
                                {
                                    var func = TAKE_SENTENCE[i];
                                    var value = func(n1,n2,n3,n4, _operator[0], _operator[1], _operator[2]);

                                    var _result = eval(value);
                                    if( _result == 24 )
                                    {
                                        return value;
                                    }
                                }
                            }
                        }
                    }

                    return null;
                };

            var take_input_sort =
                function(n1,n2,n3,n4)
                {
                    const _numberSort =
                        [
                            [n1,n2,n3,n4],
                            [n1,n2,n4,n3],
                            [n1,n3,n2,n4],
                            [n1,n3,n4,n2],
                            [n1,n4,n2,n3],
                            [n1,n4,n3,n2],
                        ];

                    for( var i in _numberSort )
                    {
                        const _numberArray = _numberSort[i];
                        const _result = take_sentence_once(_numberArray[0], _numberArray[1], _numberArray[2], _numberArray[3]);

                        if( _result != null )
                        {
                            return _result;
                        }
                    }

                    return null;
                };

            var instance =
            {
                ////////
                input:function(n1,n2,n3,n4)
                {
                    const _numberSort =
                        [
                            [n1, n2, n3, n4],
                            [n2, n1, n3, n4],
                            [n3, n1, n2, n4],
                            [n4, n1, n2, n3],
                        ];

                    for( var i in _numberSort )
                    {
                        const _numberArray = _numberSort[i];
                        const _result = take_input_sort(_numberArray[0], _numberArray[1], _numberArray[2], _numberArray[3]);

                        if( _result != null )
                        {
                            return _result;
                        }
                    }

                    return null;
                },
            };

            return instance;
        }
    )();

module.exports =
{
    math24Method:function(a,b,c,d)
    {
        return Math24Method.input(a,b,c,d);
    },
    createMath24Table:function(s)
    {
        var _indexTable = [];

        for( var a=1; a<=10; a++ )
        {
            for( var b=a; b<=10; b++ )
            {
                for( var c=b; c<=10; c++ )
                {
                    for( var d=c; d<=10; d++ )
                    {
                        const _number = [a,b,c,d];
                        _indexTable.push(_number);
                    }
                }
            }
        }

        for( var i in _indexTable )
        {
            const _number = _indexTable[i];

            var _result = this.math24Method(_number[0], _number[1], _number[2], _number[3]);

            if( _result != null )
            {
                const _inputdata =
                {
                    parament:_number,
                    result:_result
                };

                s.write(_inputdata);
                s.write(',');
            }
        }
    }
};
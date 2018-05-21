'use strict';

/* Filters */
// need load the moment.js to use this filter. 
angular.module('app.filters', [])
    .filter('fromNow', function() {
        return function(date) {
          return moment(date).fromNow();
        }
    })
    .filter('vnNumber', function ($filter) {
        return function (number) {
            return $filter('number')(number).replace(/,/g, '.');
        }
    })
    .filter('phone', function () {
        return function (tel) {
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');


            value= value.split(/[\D]+/);
            var str = '';

            switch (value[0].length) {
                case 9: // +1PPP####### -> C (PPP) ###-####
                    str    += value[0].slice(0, 3);
                    str    += '-'+value[0].slice(3,6);
                    str    += '-'+value[0].slice(6);
                    break;

                case 10 : // +CPPP####### -> CCC (PP) ###-####
                case 11 :
                    str    += value[0].slice(0, 4);
                    str    += '-'+value[0].slice(4,7);
                    str    += '-'+value[0].slice(7);
                    break;

                default:
                    return tel;
            }

            if(value[1]){
                switch (value[1].length) {
                    case 9: // +1PPP####### -> C (PPP) ###-####
                        str    += ' , '+value[1].slice(0, 3);
                        str    += '-'+value[1].slice(3,6);
                        str    += '-'+value[1].slice(6);
                        break;

                    case 10 : // +CPPP####### -> CCC (PP) ###-####
                    case 11 :
                        str    += ' , '+value[1].slice(0, 4);
                        str    += '-'+value[1].slice(4,7);
                        str    += '-'+value[1].slice(7);
                        break;

                    default:
                        return tel;
                }
            }

            return str.trim();
        };
    })
    .filter('exists', function () {
        return function (arr) {
            var r = [];
            if (arr) {
                angular.forEach(arr, function(value, key) {
                    if(value){
                        r.push(value);
                    }
                });
                return r;
            }
            return [];
        }
    })
    .filter('orderObjectBy', function(){
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for(var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b){
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
    });;
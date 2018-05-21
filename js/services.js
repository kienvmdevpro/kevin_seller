'use strict';

/* Services */


// Demonstrate how to register services
angular.module('app.services', [])
.service('$json', function () {
		JSON.toParams = $.param;
		return JSON;
	})
.service('Storage', ['$localStorage', '$state', '$timeout', 'toaster','$filter', 
           function ($localStorage,    $state,   $timeout,   toaster,  $filter) {
	var tran = $filter('translate');
    return {
            remove: function(){
                delete $localStorage['login'];
                delete $localStorage['time_login'];
                //toaster.pop('error', 'Thông báo', 'Bạn chưa đăng nhập tài khoản!');
                toaster.pop('error',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaDangNhap'));
                var yourTimer = $timeout(function() {
                    $state.go('access.signin');
                }, 1500);
            }
        }
}])
.service('PhpJs', function () {
        var rtrim = function (str, charlist) {
            charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
            var re = new RegExp('[' + charlist + ']+$', 'g');
            return (str + '').replace(re, '');
        };

        var addslashes = function(str){
            return (str + '')
                .replace(/[\\"']/g, '\\$&')
                .replace(/\u0000/g, '\\0');
        };

        var array_merge_recursive = function(arr1, arr2){
            var idx = '';
            if (arr1 && Object.prototype.toString.call(arr1) === '[object Array]' &&
                arr2 && Object.prototype.toString.call(arr2) === '[object Array]') {
                for (idx in arr2) {
                    arr1.push(arr2[idx]);
                }
            } else if ((arr1 && (arr1 instanceof Object)) && (arr2 && (arr2 instanceof Object))) {
                for (idx in arr2) {
                    if (idx in arr1) {
                        if (typeof arr1[idx] === 'object' && typeof arr2 === 'object') {
                            arr1[idx] = this.array_merge(arr1[idx], arr2[idx]);
                        } else {
                            arr1[idx] = arr2[idx];
                        }
                    } else {
                        arr1[idx] = arr2[idx];
                    }
                }
            }

            return arr1;
        };

        var utf8_encode = function(string){
            string = (string+'').replace(/\r\n/g, "\n").replace(/\r/g, "\n");

            var utftext = "";
            var start, end;
            var stringl = 0;

            start = end = 0;
            stringl = string.length;
            for (var n = 0; n < stringl; n++) {
                var c1 = string.charCodeAt(n);
                var enc = null;

                if (c1 < 128) {
                    end++;
                } else if((c1 > 127) && (c1 < 2048)) {
                    enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
                } else {
                    enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
                }
                if (enc != null) {
                    if (end > start) {
                        utftext += string.substring(start, end);
                    }
                    utftext += enc;
                    start = end = n+1;
                }
            }

            if (end > start) {
                utftext += string.substring(start, string.length);
            }

            return utftext;
        }

        var md5 = function(str){
            var xl;

            var rotateLeft = function(lValue, iShiftBits) {
                return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
            };

            var addUnsigned = function(lX, lY) {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = (lX & 0x80000000);
                lY8 = (lY & 0x80000000);
                lX4 = (lX & 0x40000000);
                lY4 = (lY & 0x40000000);
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4) {
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                }
                if (lX4 | lY4) {
                    if (lResult & 0x40000000) {
                        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    } else {
                        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                    }
                } else {
                    return (lResult ^ lX8 ^ lY8);
                }
            };

            var _F = function(x, y, z) {
                return (x & y) | ((~x) & z);
            };
            var _G = function(x, y, z) {
                return (x & z) | (y & (~z));
            };
            var _H = function(x, y, z) {
                return (x ^ y ^ z);
            };
            var _I = function(x, y, z) {
                return (y ^ (x | (~z)));
            };

            var _FF = function(a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var _GG = function(a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var _HH = function(a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var _II = function(a, b, c, d, x, s, ac) {
                a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };

            var convertToWordArray = function(str) {
                var lWordCount;
                var lMessageLength = str.length;
                var lNumberOfWords_temp1 = lMessageLength + 8;
                var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                var lWordArray = new Array(lNumberOfWords - 1);
                var lBytePosition = 0;
                var lByteCount = 0;
                while (lByteCount < lMessageLength) {
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
                    lByteCount++;
                }
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                return lWordArray;
            };

            var wordToHex = function(lValue) {
                var wordToHexValue = '',
                    wordToHexValue_temp = '',
                    lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount++) {
                    lByte = (lValue >>> (lCount * 8)) & 255;
                    wordToHexValue_temp = '0' + lByte.toString(16);
                    wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
                }
                return wordToHexValue;
            };

            var x = [],
                k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
                S12 = 12,
                S13 = 17,
                S14 = 22,
                S21 = 5,
                S22 = 9,
                S23 = 14,
                S24 = 20,
                S31 = 4,
                S32 = 11,
                S33 = 16,
                S34 = 23,
                S41 = 6,
                S42 = 10,
                S43 = 15,
                S44 = 21;

            str = utf8_encode(str);
            x = convertToWordArray(str);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;

            xl = x.length;
            for (k = 0; k < xl; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = addUnsigned(a, AA);
                b = addUnsigned(b, BB);
                c = addUnsigned(c, CC);
                d = addUnsigned(d, DD);
            }

            var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

            return temp.toLowerCase();
        };

        var ScenarioTime    = function(time_str){
            var str = '';
            if(time_str > 0){
                var hours   = Math.floor(time_str/60);

                if(hours > 518400){
                    str   = Math.floor(hours/518400)+' năm';
                }
                else if(hours > 43200){ // 30 ngày
                    str   = Math.floor(hours/43200)+' tháng';
                }else if(hours > 1440){ // 1 ngày
                    str   = Math.floor(hours/1440)+' ngày';
                }else if(hours > 60){// 1 hours
                    str   = Math.floor(hours/60)+' giờ';
                }else if(hours > 0){
                    str   = hours+' phút';
                }else{
                    str   = '1 phút';
                }

            }
            return str;
        };
        var ScenarioTime_en    = function(time_str){
            var str = '';
            if(time_str > 0){
                var hours   = Math.floor(time_str/60);

                if(hours > 518400){
                    str   = Math.floor(hours/518400)+' year(s)';
                }
                else if(hours > 43200){ // 30 ngày
                    str   = Math.floor(hours/43200)+' month(s)';
                }else if(hours > 1440){ // 1 ngày
                    str   = Math.floor(hours/1440)+' day(s)';
                }else if(hours > 60){// 1 hours
                    str   = Math.floor(hours/60)+'hour(s)';
                }else if(hours > 0){
                    str   = hours+' minute(s)';
                }else{
                    str   = '1 minute';
                }

            }
            return str;
        };

        var convertString = function (obj){
            if(obj !== null && typeof obj === 'object'){
                var keys = Object.keys(obj);
                var val  = '';
                for (var i = 0; i < keys.length; i++) {
                    val += obj[keys[i]];
                    // use val
                }
                return val;
            }else{
                return obj;
            }
        }

        return {
            rtrim                   : rtrim,
            addslashes              : addslashes,
            md5                     : md5,
            array_merge_recursive   : array_merge_recursive,
            ScenarioTime            :ScenarioTime,
            ScenarioTime_en			:ScenarioTime_en,
            convertString           : convertString
        }
})
.service('User', ['$http', 'Api_Path', 'Storage', 'toaster','$filter', 
         function ($http,  Api_Path,    Storage,   toaster,  $filter) {
		var tran = $filter('translate');
        return{ 
            load : function(){ 
                return $http({
                    url: Api_Path.User+'show',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                       // toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi !');
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                });
                return;
            },
            child_users : function(){ 
                return $http({
                    url: Api_Path.User+'child-users',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                       // toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi !');
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                });
                return;
            },
            edit_info : function(data){
                return $http({
                    url: Api_Path.User+'edit-info',
                    method: "POST",
                    data: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), result.message);
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công !');
                    	toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },
            edit : function(data){ 
                return $http({
                    url: Api_Path.User+'edit',
                    method: "POST",
                    data: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công !');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                })
            },
            load_key : function(){
                return $http({
                    url: Api_Path.ApiKey+'index',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                        //toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi !');
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

            },
            create_key : function(){
                return $http({
                    url: Api_Path.ApiKey + 'create',
                    method: "POST",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                        //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                    }else{
                       // toaster.pop('success', 'Thông báo', 'Thành công !');
                    	 toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },
            edit_key : function(data,id){
                return $http({
                    url: Api_Path.ApiKey + 'edit/'+id,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công !');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                      //  toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            edit_auto : function(data,id){
                return $http({
                    url: Api_Path.ApiKey + 'auto/'+id,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công !');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            edit_check : function(data,id){
                return $http({
                    url: Api_Path.ApiKey + 'check/'+id,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công !');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            load_link_api : function(){
                return $http({
                    url: Api_Path.ApiKey+'listurlapi',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                       // toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi !');
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                });
                return;
            },
            add_link_api : function(data){
                return $http({
                    url: Api_Path.ApiKey + 'addurl',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        if(result.error_code && result.error_code == 'bm_verify_fail'){
                            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_Verify'));        
                        }else{
                            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                        }
                        
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công !');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            delete_link_api : function(data){
                return $http({
                    url: Api_Path.ApiKey + 'delete-url',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                        
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công !');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            }
        }
            
}])
.service('UserInfo', ['$http', 'Api_Path', 'Storage', 'toaster','$filter', 
             function ($http,  Api_Path,    Storage,   toaster,  $filter) {
	var tran = $filter('translate');   
	return{ 
            load : function(){ 
                return $http({
                    url: Api_Path.UserInfo+'show',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi !');
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            edit : function(){
                return $http({
                    url: Api_Path.UserInfo+'create',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi !');
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            result_change_email : function(refer){
                if(refer != undefined && refer != ''){
                    return $http({
                        //url: ApiPath+'access/confirmchangenl/'+refer,
                        //url: ApiPath+'access/confirmchangenl/'+refer,
                        url: Api_Path.UserInfo+'confirmchangenl/'+refer,

                        method: "GET",
                        dataType: 'json'
                    }).success(function (result, status, headers, config) {

                    }).error(function (data, status, headers, config) {
                        if(status == 440){
                            Storage.remove();
                        }else{
                        	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                            //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        }
                    })
                }

                return;
            },
            send_otp : function(data){
                return $http({
                    url: Api_Path.UserInfo+'send-otp',
                    method: "GET",
                    params: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Thất bại !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            resend_otp : function(data){
                return $http({
                    url: Api_Path.UserInfo+'re-send-otp',
                    method: "GET",
                    params: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }else{
                        //toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            }
        }
}])
.service('Bussiness', ['$http', '$q', 'Api_Path', 'Storage', 'toaster','$filter', 
              function ($http,  $q,    Api_Path,   Storage,   toaster,  $filter) {
	var tran = $filter('translate');  
        return{ 
            load : function(){ 
                return $http({
                    url: Api_Path.Bussiness+'show',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            create : function(data){ 
                return $http({
                    url: Api_Path.Bussiness+'create',
                    method: "POST",
                    data: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                    	 toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                        //toaster.pop('warning', 'Thông báo', 'Lỗi, hãy thử lại !');
                    }else{
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            }
        }
            
}])
.service('ConfigShipping', ['$filter','$http', '$q', 'Api_Path', 'Storage', 'toaster', 
                   function ($filter,  $http,   $q,   Api_Path,  Storage,    toaster) {
	var tran = $filter('translate');  
	return{
        load : function(){
            return $http({
                url: Api_Path.FeeConfig+'show',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                   // toaster.pop('warning', 'Thông báo', 'Bạn chưa cấu hình tính phí vận chuyển !');
                	 toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaCauHinhTinhPhi'));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        }
    }

}])
.service('Inventory', ['$filter','$http', '$q', 'Api_Path', 'Storage', 'toaster', 
              function ($filter,  $http,  $q,   Api_Path,    Storage,   toaster) {
	var tran = $filter('translate');  
	return{ 
            load : function(){
                return $http({
                    url: Api_Path.Inventory+'show',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            loadWithPostOffice : function(params){
                return $http({
                    url: Api_Path.Inventory+'show-with-postoffice',
                    params: params,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            create : function(data){ 
                return $http({
                    url: Api_Path.Inventory+'create',
                    method: "POST",
                    data: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        //toaster.pop('warning', 'Thông báo', 'Lỗi, hãy thử lại !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }else{
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            }
        }
            
}])
.factory('AppStorage', ['$http', '$q', 'Api_Path', 'Storage', 'toaster', 'PhpJs','$filter', 
              function ($http,    $q,    Api_Path,  Storage,    toaster,  PhpJs,  $filter) {
	var tran = $filter('translate');  
	var AppStorage = function (){
        this.cities = [];
        this.districts = [];
        this.wards = [];
    }
    window.bodauTiengViet = function(str) {  
        if(!str){
            return str;
        }
        str= str.toLowerCase();  
        str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");  
        str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");  
        str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");  
        str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");  
        str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");  
        str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");  
        str= str.replace(/đ/g,"d");  
        return str;  
    }

    AppStorage.prototype.loadCity = function (callback){
        var self = this;

        if(self.cities.length > 0){
            return callback && typeof callback == 'function' ? callback(self.cities) : false;
        }

        $http.get(ApiPath + 'city?limit=all').success(function (resp){
            if(!resp.error){
                self.cities = resp.data.map(function (value){
                    value.tieng_viet_khong_dau = window.bodauTiengViet(value.city_name);
                    return value;
                });
                return callback && typeof callback == 'function' ? callback(self.cities) : false;
            }

            //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
        })
    }

    AppStorage.prototype.loadDistrict = function (callback){
        var self = this;

        if(self.districts.length > 0){
            return callback && typeof callback == 'function' ? callback(self.districts) : false;
        }

        $http.get(ApiPath + 'district/all').success(function (resp){
            if(!resp.error){
                self.districts = resp.data.map(function (value){
                    value.tieng_viet_khong_dau = window.bodauTiengViet(value.district_name);
                    return value;
                });

                return callback && typeof callback == 'function' ? callback(self.districts) : false;
            }
           // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
        })
    }

    AppStorage.prototype.loadWard = function (callback){
        var self = this;

        if(self.wards.length > 0){
            return callback && typeof callback == 'function' ? callback(self.wards) : false;
        }

        $http.get(ApiPath + 'ward/all').success(function (resp){
            if(!resp.error){
                self.wards = resp.data.map(function (value){
                    value.tieng_viet_khong_dau = window.bodauTiengViet(value.ward_name);
                    return value;
                });
                return callback && typeof callback == 'function' ? callback(self.wards) : false;
            }
           //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
        })
    }

    AppStorage.prototype.getDistrictByCity = function (city_id){
        var self   = this;
        var output = [];
        angular.forEach(self.districts, function (value, key){
            if(value.city_id == city_id){
                value.wards = [];
                if(value.remote == 2){
                    value.wards = self.getWardByDistrict(value.id);
                }
                output.push(value);
            }
        })

        return output;
    }

    AppStorage.prototype.getWardByDistrict = function (district_id){
        var self   = this;
        var output = [];
        angular.forEach(self.wards, function (value, key){
            if(value.district_id == district_id){
                output.push(value);
            }
        })
        return output;

    }



    return new AppStorage();
}]) 
.service('Location', ['$http', '$q', 'Api_Path', 'Storage', 'toaster', 'PhpJs','$filter', 
             function ($http,  $q,    Api_Path,  Storage,    toaster,   PhpJs,  $filter) {
	var tran = $filter('translate');   
	return{
            country: function (){
                var url = ApiUrl + 'api/base' + '/country';

                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },

            city_global: function (country_id, q){
                var url = ApiUrl + 'api/v1/mobile' + '/city-global/'+country_id + '?q=' + q;
                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                      //  toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },

            province : function(limit){
                var url_location    = ApiPath+'city';
                if(limit.length > 0){
                    url_location    += '?limit='+limit;
                }
                
                return $http({
                    url: url_location,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            
            district : function(province_id,limit, remote){
                var url_location    = ApiPath+'district?';
                if(province_id > 0){
                    url_location += 'city_id='+province_id+'&';
                }
                
                if(limit.length > 0){
                    url_location += 'limit='+limit+'&';
                }

                if(remote){
                    url_location += 'remote=true&';
                }

                return $http({
                    url: PhpJs.rtrim(url_location,'&'),
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            ward : function(district_id,limit){
                var url_location    = ApiPath+'ward?';
                if(district_id > 0){
                    url_location += 'district_id='+district_id+'&';
                }
                
                if(limit.length > 0){
                    url_location += 'limit='+limit+'&';
                }

                return $http({
                    url: PhpJs.rtrim(url_location,'&'),
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            SuggestAll  : function(val){
                if(val == '' || val == undefined){
                    return;    
                }

                return $http({
                    url: Api_Path.Base+'_search/address?q='+PhpJs.addslashes(val)+'&size=10',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            }
        }
}])
.service('Order', ['$http', '$q','$window','Api_Path', 'Storage','toaster','PhpJs','$localStorage','Analytics','$filter', '$rootScope', 
         function ($http,  $q,    $window, Api_Path,   Storage,  toaster,  PhpJs,   $localStorage, Analytics ,  $filter, $rootScope) {
	var tran = $filter('translate');
	return {
            PipeStatus : function(group,type){
                return $http({
                    url: ApiPath +'pipestatus/pipegroup?group='+group+'&type='+type,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                })

                return;
            },
            AcceptStatus: function (data, callback){
                $http({
                url         : ApiJourney + 'acceptstatus',
                method      : "POST",
                data        : data,
                dataType    : 'json'                
                }).success(function (result, status, headers, config) {
                    var error = true;
                    if(result.error == 'success'){
                        error = false;
                        //toaster.pop('success', 'Thông báo', 'Cập nhật thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }
                    callback(error, result.data);
                }).error(function (data, status, headers, config) {
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    callback(true, data.message);
                });
            },
            AcceptOverWeight: function (sc_code, callback){
                $http({
                url: Api_Path.ChangeOrder+'/accept-orderweight',
                method: "POST",
                data: {TrackingCode: sc_code},
                dataType: 'json'                
                }).success(function (result, status, headers, config) {
                    callback(result.error, result.data);
                }).error(function (data, status, headers, config) {
                    callback(true, data.message);
                });
            }, 
            CountOrderProcess : function (callback){
                var date                = new Date();
                var time_create_start   = Date.parse(new Date(date.getFullYear(), date.getMonth() - 1 , date.getDate()))/1000;
                

                var url_location  = Api_Path.Order+'/group-order-process?';
                url_location += 'time_create_start=' + time_create_start + '&';
                /*url_location += 'time_create_end=' + time_create_end + '&';*/
                url_location += 'cmd=json&';

                $http({
                    url: url_location,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    callback(null, result);
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        callback(data, null);
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },
            suggestProductInfo :function (val){
                var sellerId = ($localStorage['login']) ? $localStorage['login'].id : 0;
                if(val == '' || val == undefined){
                    return;    
                }
                
                return $http({
                    //url: Api_Path.SearchProduct+PhpJs.addslashes(val)+' AND seller_id:'+sellerId+'&size=10',
                    url: ApiPath+'_search/items?q='+PhpJs.addslashes(val)+'&size=10',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                
            },
            suggestBuyerInfo :function (val){
                var sellerId = ($localStorage['login']) ? $localStorage['login'].id : 0;
                if(val == '' || val == undefined){
                    return;    
                }
                
                return $http({
                    url: ApiPath+'_search/buyers?q='+PhpJs.addslashes(val)+'&size=10',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                
            },
            UpdateStatus: function (data, callback){
                return $http({
                    url: Api_Path.Order+'/update-order-status',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        callback(result.message, null);
                    }else {
                        callback(null, result.data);
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        callback(true, null);
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            }, 

            ListStatus : function(group){
                var url = Api_Path.OrderStatus+'/statusgroup';
                if(group){
                    url += '?group=' + group;
                }
                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

                return;
            },

            ListStatusOrderProcess : function(){
                return $http({
                    url: Api_Path.OrderStatus+'/statusgroup?statusId=18,20,15',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

                return;
            },
            Status : function(){
                return $http({
                    url: Api_Path.OrderStatus+'/statusorder',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {

                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

                return;
            },

            ListService : function(){
                return $http({
                    url: Api_Path.Base+'courier-service?active=1',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

                return;
            },

            ListCourier : function(){
                return $http({
                    url: Api_Path.Base+'courier?limit=all',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

                return;
            },
            
            Detail : function(code, type){
                return $http({
                    url: Api_Path.PublicOrder+'/show/'+code+'?type='+type,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            ListData : function(page, status, limit, search, time, cmd){
                var url_location    = Api_Path.Order+'?';
                if(status > 0){
                    url_location += 'status='+status+'&';
                }

                if(limit > 0){
                    url_location += 'limit='+limit+'&';
                }
                
                if(time == '7day'){
                    url_location += 'time_start=7&';
                }else if(time == '14day'){
                    url_location += 'time_start=14&';
                }else if(time == 'month'){
                    url_location += 'time_start=30&';
                }else if(time == '3months'){
                    url_location += 'time_start=90&';
                }

                if(search.length > 0){
                    url_location += 'search='+search+'&';
                }

                if(page > 0){
                    url_location += 'page='+page+'&';
                }

                return $http({
                    url: PhpJs.rtrim(url_location,'&'),
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },

            ListOrder : function(page, limit, data,cmd){
                var url_location    = Api_Path.Order+'/order?';

                if(limit > 0){
                    url_location += 'limit='+limit+'&';
                }

                if(data.courier != undefined && data.courier > 0){
                    url_location += 'courier_id='+data.courier+'&';
                }

                if(data.to_city != undefined && data.to_city > 0){
                    url_location += 'to_city='+data.to_city+'&';
                }

                if(data.to_district != undefined && data.to_district > 0){
                    url_location += 'to_district='+data.to_district+'&';
                }

                if(data.search != undefined && data.search.length > 0){
                    url_location += 'search='+data.search+'&';
                }

                if(data.list_status != undefined && data.list_status != []){
                    url_location += 'list_status='+data.list_status+'&';
                }

                if(data.inventory != undefined && data.inventory > 0){
                    url_location += 'inventory='+data.inventory+'&';
                }
                if(data.createby != undefined && data.createby > 0){
                    url_location += 'createby='+data.createby+'&';
                }

                if(data.time_create_start != undefined && data.time_create_start > 0){
                    url_location += 'time_create_start='+data.time_create_start+'&';
                }
                if(data.time_create_end != undefined && data.time_create_end > 0){
                    url_location += 'time_create_end='+data.time_create_end+'&';
                }
                if(data.time_accept_start != undefined && data.time_accept_start > 0){
                    url_location += 'time_accept_start='+data.time_accept_start+'&';
                }
                if(data.time_accept_end != undefined && data.time_accept_end > 0){
                    url_location += 'time_accept_end='+data.time_accept_end+'&';
                }

                if(data.time_success_start != undefined && data.time_success_start > 0){
                    url_location += 'time_success_start='+data.time_success_start+'&';
                }
                if(data.time_success_end != undefined && data.time_success_end > 0){
                    url_location += 'time_success_end='+data.time_success_end+'&';
                }
                if(data.check_verify != undefined){ 
                    url_location += 'check_verify='+data.check_verify+'&'; 
                }
                if(data.check_verify != undefined){ 
                    url_location += 'check_verify='+data.check_verify+'&'; 
                }
                if(data.time_pickup_start != undefined && data.time_pickup_start != ''){ 
                    url_location += 'time_pickup_start='+data.time_pickup_start+'&'; 
                }
                if(data.time_pickup_end != undefined && data.time_pickup_end != ''){ 
                    url_location += 'time_pickup_end='+data.time_pickup_end+'&'; 
                }
                if(data.status != undefined && data.status != ''){ 
                    url_location += 'status='+data.status+'&'; 
                }
                if(page > 0){
                    url_location += 'page='+page+'&';
                }

                if(cmd != undefined && cmd != ''){
                    url_location += 'cmd='+cmd+'&';
                    url_location += 'access_token='+$rootScope.userInfo.token+'&';
                    
                    $window.open(PhpJs.rtrim(url_location,'&'), '_blank');
                    return '';
                }

                return $http({
                    url: PhpJs.rtrim(url_location,'&'),
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },


            ListOrderProcess : function(page, limit, search, list_status, time_create_start, time_create_end, time_accept_start, time_accept_end, courier, to_city, to_district, cmd, over_weight, tab_option){
                var url_location    = Api_Path.Order+'/order-process?';

                if(limit > 0){
                    url_location += 'limit='+limit+'&';
                }

                if(courier > 0){
                    url_location += 'courier_id='+courier+'&';
                }

                if(to_city > 0){
                    url_location += 'to_city='+to_city+'&';
                }

                if(to_district > 0){
                    url_location += 'to_district='+to_district+'&';
                }


                if(search.length > 0){
                    url_location += 'search='+search+'&';
                }

                if(list_status != undefined && list_status != []){
                    url_location += 'list_status='+list_status+'&';
                }

                if(time_create_start > 0){
                    url_location += 'time_create_start='+time_create_start+'&';
                }
                if(time_create_end > 0){
                    url_location += 'time_create_end='+time_create_end+'&';
                }
                if(time_accept_start > 0){
                    url_location += 'time_accept_start='+time_accept_start+'&';
                }
                if(time_accept_end > 0){
                    url_location += 'time_accept_end='+time_accept_end+'&';
                }

                if(over_weight && over_weight == true){
                    url_location += 'over_weight=true&';
                }
                if(tab_option && tab_option !== 'export'){
                    url_location += 'tab_option='+tab_option+'&';
                }

                if(tab_option && tab_option == 'export'){
                    url_location += 'cmd='+tab_option+'&';
                    url_location += 'access_token='+$rootScope.userInfo.token+'&';
                    $window.open(PhpJs.rtrim(url_location,'&'), '_blank');
                    return '';
                }
                

                if(page > 0){
                    url_location += 'page='+page+'&';
                }

                if(cmd != undefined && cmd != ''){
                    url_location += 'cmd='+cmd+'&';
                    url_location += 'access_token='+$rootScope.userInfo.token+'&';
                    
                    $window.open(PhpJs.rtrim(url_location,'&'), '_blank');
                    return '';
                }

                return $http({
                    url: PhpJs.rtrim(url_location,'&'),
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },
            


            Calculate : function(data){
                return $http({
                    url: ApiRest+'courier/calculate',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            CalculateVN : function (data){
                var urlCalculate = ApiPath+'courier/calculate';
                return $http({
                    url: urlCalculate,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },

            CalculateGlobal : function (data){
                var urlCalculate = ApiPath+'courier/calculate';
                var   urlCalculate = ApiPath+'global/calculate';
                return $http({
                    url: urlCalculate,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            
            Create : function(data){
                return $http({
                    url: ApiRest+'courier/create',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ToaDonLoi') +  PhpJs.convertString(result.message));
                    }else{
                        try {
                            if(fbq){
                                fbq('track', 'AddToCart');
                            }
                        }catch(err) {
                            
                        }
                        
                        
                        Analytics.trackEvent('Order', 'Account Create Order', 'Account Order');


                       // toaster.pop('success', 'Thông báo', 'Tạo vận đơn thành công !');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ToaDonThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },

            CreateV2 : function(data){
                return $http({
                    url: ApiRest+'courier/create',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        //toaster.pop('warning', 'Thông báo', 'Tạo vận đơn lỗi ! ' +  PhpJs.convertString(result.message));
                    }else{
                        try {
                            if(fbq){
                                fbq('track', 'AddToCart');
                            }
                        }catch(err) {
                            
                        }
                        
                        
                        Analytics.trackEvent('Order', 'Account Create Order', 'Account Order');
                        

                        if (data['Config']['AutoAccept'] == 1) {
                            try {
                                if(fbq){
                                    fbq('track', 'InitiateCheckout');
                                }
                            }catch(err) {
                                
                            }
                           

                            Analytics.trackEvent('Accept Order', 'Account Accepted', 'Account Accepted Order');

                            
                        }
                        
                        //toaster.pop('success', 'Thông báo', 'Tạo vận đơn thành công !');
                       // toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ToaDonThanhCong'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                    	 toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                        // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    }
                })
                return;
            },

            CreateV2Global : function(data){
                var urlCreate = ApiPath+'courier/create_lading';
                if(data['Config']['Service'] == 8 || data['Config']['Service'] == 9 || (data['Config']['Service'] == 15 && data['To']['Country'] && data['To']['Country'] != 237)){
                    urlCreate = ApiPath+'global/create_lading';
                }
                return $http({
                    url: urlCreate,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                    }else{
                        try {
                           if(fbq){
                                fbq('track', 'AddToCart');
                            }
                        }catch(err) {
                            
                        }
                        // if(fbq){
                        //     fbq('track', 'AddToCart');
                        // }
                        
                        Analytics.trackEvent('Order', 'Account Create Order', 'Account Order');
                       

                        if (data['Config']['AutoAccept'] == 1) {
                            try {
                                if(fbq){
                                    fbq('track', 'InitiateCheckout');
                                }
                             }catch(err) {
                                 
                             }
                            

                            Analytics.trackEvent('Accept Order', 'Account Accepted', 'Account Accepted Order');

                          
                        }
                        
                        //toaster.pop('success', 'Thông báo', 'Tạo vận đơn thành công !');
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },


            CreateProcess: function (data, callback){
                $http({
                    url: Api_Path.OrderProcess+'create',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        //toaster.pop('warning', 'Thông báo', 'Tạo yêu cầu lỗi !', PhpJs.convertString(result.message));
                        callback(true, null);
                    }else{
                        callback(null, result);
                        //toaster.pop('success', 'Thông báo', 'Tạo yêu cầu thành công !');
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        callback(true, null);
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    }
                })
            },
            Edit  : function(data){
                return $http({
                    url: Api_Path.ChangeOrder+'/edit',
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                        if(data.status == 21){
                            try {
                                if(fbq){
                                    fbq('track', 'InitiateCheckout');
                                }
                            }catch(err) {
                                
                            }
                            

                            Analytics.trackEvent('Accept Order', 'Account Accepted', 'Account Accepted Order');


                        }

                        if(data.status == 22 || data.status == 28){

                            Analytics.trackEvent('Cancel Order', 'Account Cancel', 'Account Cancel Complete');
                           
                        }
                        toaster.pop('success', 'Thông báo', 'Cập nhật thành công!');
                    }else{
                        if(result.error_message != undefined){
                            toaster.pop('warning', 'Thông báo', result.error_message);
                        }else{
                            //toaster.pop('warning', 'Thông báo', 'Cập nhật lỗi !');
                            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                        }
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            CreateExcel : function(id,stock_id, checking, post_office, accept, is_global){
                var url = Api_Path.Order+'/createorder/' + id + '?stock_id='+stock_id;
                if(is_global){
                    var url = Api_Path.Order+'/createorderglobal/' + id + '?stock_id='+stock_id;    
                }
                if(checking){
                    url +=  '&checking='+checking;
                }
                if(post_office){
                    url +=  '&post_office=true';
                }
                if(accept){
                    url +=  '&accept='+accept;
                }


                return $http({
                    url: url, 
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                        //toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                        toaster.pop('warning',tran('toaster_ss_nitifi'), PhpJs.convertString(result.message));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            CreateExcelLamido : function(id){
                return $http({
                    url: Api_Path.Order+'/createorderlamido?id='+id,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                       // toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                        toaster.pop('warning', tran('toaster_ss_nitifi'), PhpJs.convertString(result.message));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            CreateExcelMulti : function(id){
                return $http({
                    url: Api_Path.Order+'/createmultiexcel/'+id,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning', 'Thông báo', PhpJs.convertString(result.message));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },
            ListExcel : function(id, page, status){
                var url  = Api_Path.Order+'/listexcel/'+id+'?page='+page;
                if(status != undefined && status != ''){
                    url += '&status='+status;
                }

                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            ChangeExcel : function(data,key){
                return $http({
                    url: Api_Path.Order+'/changelog/'+key,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                        //toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            RemoveExcel : function(key){
                return $http({
                    url: Api_Path.Order+'/removelog/'+key,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                       // toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            ReportPickup : function(data){
                var url = Api_Path.Order+'/report-pickup';
                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json',
                    params: data
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

                return;
            },
            ProcessProblem : function(page, data, cmd){
                var url = Api_Path.OrderProcess+'order-process?page='+ page;

                if(cmd != ''){
                    url += '&cmd=' + cmd;
                    url += 'access_token='+$rootScope.userInfo.token+'&';
                    $window.open(PhpJs.rtrim(url,'&'), '_blank');
                                        
                }

                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json',
                    params: data
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                      //  toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                });
            },
            PipeDetail : function(data){
                return $http({
                    url: Api_Path.OrderProcess+'pipe-journey-detail',
                    method: "GET",
                    dataType: 'json',
                    params: data
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                });
            },
            Synonyms : function(id){
                return $http({
                    url: Api_Path.Order +'/synonyms/'+id,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                    }
                }).error(function (data, status, headers, config) {
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                })

                return;
            }
        }
}])
.service('Print', ['$http','$q','Api_Path','Storage','toaster','$filter', 
          function ($http,  $q,  Api_Path,  Storage,  toaster,  $filter) {
	var tran = $filter('translate');    
	return{
            
            Multi : function(param){
                return $http({
                    url: Api_Path.PublicOrder+'/printmulti/'+param,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        toaster.pop('warning', 'Thông báo', result.message);
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            Hvc : function(param){
                return $http({
                    url: Api_Path.PublicOrder+'/print/'+param,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error) {
                        toaster.pop('warning', 'Thông báo', result.message);
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            }
        }
}])
.service('Verify', ['$http', '$q', 'Api_Path', 'Storage', 'toaster', 'PhpJs','$filter',
          function ($http,   $q,   Api_Path,   Storage,    toaster,    PhpJs, $filter) {
	var tran = $filter('translate');
        return{
            // verify
            OrderVerify : function(time_start,time_end, search,page,limit){
                var url = Api_Path.OrderVerify+'?';
                
                if(time_start != undefined && time_start != ''){
                    url = url + 'time_start='+time_start+'&';
                }
                
                if(time_end != undefined && time_end != ''){
                    url = url + 'time_end='+time_end+'&';
                }

                if(search != undefined && search != ''){
                    url = url + 'search='+search+'&';
                }

                if(limit != undefined && limit != ''){
                    url = url + 'limit='+limit+'&';
                }
                
                if(page > 0){
                    url = url + 'page='+page+'&';
                    
                }
                
                return $http({
                    url: PhpJs.rtrim(url,'&'),
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                       // toaster.pop('warning', 'Thông báo', 'Load Thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                      //  toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            WarehouseVerify : function(time_start, time_end, search, page, limit){
                var url = Api_Path.WarehouseVerify+'?';
                
                if(time_start != undefined && time_start != ''){
                    url = url + 'time_start='+time_start+'&';
                }
                
                if(time_end != undefined && time_end != ''){
                    url = url + 'time_end='+time_end+'&';
                }

                if(search != undefined && search != ''){
                    url = url + 'search='+search+'&';
                }

                if(limit != undefined && limit != ''){
                    url = url + 'limit='+limit+'&';
                }
                
                if(page > 0){
                    url = url + 'page='+page+'&';
                    
                }
                
                return $http({
                    url: PhpJs.rtrim(url,'&'),
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                       // toaster.pop('warning', 'Thông báo', 'Load Thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                      //  toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            WarehouseFee: function(page, data, cmd) {
                var url = Api_Path.WarehouseVerify + '/warehouse-fee?page=' + page;

                if (cmd != undefined && cmd != '') {
                    url += '&cmd=' + cmd;
                }

                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json',
                    params: data
                }).success(function(result, status, headers, config) {
                    if (result.error) {
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function(data, status, headers, config) {
                    if (status == 440) {
                        Storage.remove();
                    } else {
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

            },
            WarehouseFeeDetails: function(id) {
                var url = Api_Path.WarehouseVerify + '/detail-warehouse-fee';
                return $http({
                    url: url,
                    method: "GET",
                    dataType: 'json',
                    params: { 'id': id }
                }).success(function(result, status, headers, config) {
                    if (result.error) {
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function(data, status, headers, config) {
                    if (status == 440) {
                        Storage.remove();
                    } else {
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })

            },
            VerifyShow : function(key, time_start){
                return $http({
                    url: Api_Path.OrderVerify+'/show/'+key+'?time_start='+time_start,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        //toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            },
            Freeze : function(id){
                return $http({
                    url: Api_Path.Seller+'verify/show-freeze/'+id,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                       // toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                      //  toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
            }
        }
}])
.service('Invoice', ['$http','$q', 'Api_Path', 'Storage', 'toaster', 'PhpJs','$filter',
            function ($http,  $q,   Api_Path,   Storage,   toaster,  PhpJs,   $filter) {
	var tran = $filter('translate');  
	return{
        OrderInvoice : function(time_start,time_end, search,page,limit){
            var url = Api_Path.OrderInvoice+'?';

            if(time_start != undefined && time_start != ''){
                url = url + 'time_start='+time_start+'&';
            }

            if(time_end != undefined && time_end != ''){
                url = url + 'time_end='+time_end+'&';
            }

            if(search != undefined && search != ''){
                url = url + 'search='+search+'&';
            }

            if(limit != undefined && limit != ''){
                url = url + 'limit='+limit+'&';
            }

            if(page > 0){
                url = url + 'page='+page+'&';
            }

            return $http({
                url: PhpJs.rtrim(url,'&'),
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error){
                   // toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        }
    }
}])
.service('Transaction', ['$http','$q','$window','Api_Path','Storage','toaster','PhpJs','$filter',  '$rootScope',
               function ( $http,  $q,  $window,  Api_Path,  Storage,  toaster,  PhpJs,  $filter, $rootScope) {
	var tran = $filter('translate');  
    return{
        // verify
        load : function(search, time_start, time_end, page,limit, cmd){
            var url = Api_Path.Transaction+'?';

            if(time_start != undefined && time_start != ''){
                url = url + 'time_start='+time_start+'&';
            }

            if(time_end != undefined && time_end != ''){
                url = url + 'time_end='+time_end+'&';
            }

            if(search != undefined && search != ''){
                url = url + 'search='+search+'&';
            }

            if(cmd == 'export'){
                url += 'cmd='+cmd+'&';
                url += 'access_token='+$rootScope.userInfo.token+'&';
                $window.open(PhpJs.rtrim(url,'&'), '_blank');
                return '';
            }

            if(limit != undefined && limit != ''){
                url = url + 'limit='+limit+'&';
            }

            if(page > 0){
                url = url + 'page='+page+'&';
            }

            if (cmd != undefined && cmd != '') {
                url += 'cmd=' + cmd + '&';
                url += 'access_token='+$rootScope.userInfo.token+'&';
                $window.open(PhpJs.rtrim(url,'&'), '_blank');
                return '';
            }

            return $http({
                url: PhpJs.rtrim(url,'&'),
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error){
                   // toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        }
    }
}])
.service('Ticket', ['$http', '$q', 'Api_Path', 'Storage', 'toaster','$filter', 
           function ($http,  $q,    Api_Path,   Storage,   toaster,  $filter) {
	var tran = $filter('translate');
	return{
        // verify
        ListCase : function(){
            return $http({
                url: Api_Path.Base + 'ticket-case',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error){
                    //toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('warning', 'Thông báo', 'Lỗi hệ thống !');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        },
        ListCaseType : function(){
            return $http({
                url: Api_Path.Base + 'ticket-case-type',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error){
                   // toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                }
            }).error(function (data, status, headers, config) {
            })
            return;
        },
        ListFeedback : function(id){
            return $http({
                url: Api_Path.Base + 'ticket-feedback/byticket/'+id,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {

            })
            return;
        },
        ListReferTicket: function (ids, callback){
            $http({
                url: Api_Path.Base + 'ticket-refer/referseller?close=true&code='+ids,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error){
                    callback(true, result.message);
                }else {
                    callback(false, result);
                }
            }).error(function (data, status, headers, config) {
                callback(true, null);
            })
        }
    }
}])
.service('Cash', ['$http', '$q', 'Api_Path', 'Storage', 'toaster','$filter',
         function ($http,   $q,   Api_Path,   Storage,    toaster, $filter) {
	var tran = $filter('translate');  
	return{
        create : function(data){
            return $http({
                url: Api_Path.CashIn+'create',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    if(result.type == 3){
                        toaster.pop('warning', 'Thông báo', 'Thông tin thanh toán không hợp lệ !');
                    }else if(result.type == 2){
                        toaster.pop('warning', 'Thông báo', 'Gửi thông tin không thành công !');
                    }else{
                        toaster.pop('warning', 'Thông báo', 'Nạp tiền thất bại, hãy thử lại !');
                    }
                    
                }else{
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                }
            })
            return;
        },
        ResultNL : function(data){
            return $http({
                url: Api_Path.CashIn+'resultnl',
                method: "GET",
        params: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    //toaster.pop('warning', 'Thông báo', 'Lỗi, hãy thử lại !');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        }
    }

}])
.service('Notify', ['$http', '$q', 'Api_Path', 'Storage', 'toaster','$filter',
           function ($http,  $q,   Api_Path,    Storage,   toaster,  $filter) {
	var tran = $filter('translate');
	return{
        // verify
        count : function(){
            return $http({
                url: Api_Path.Base + 'queue/count',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }
            })
            return;
        },
        get : function(){
            return $http({
                url: Api_Path.Base + 'user/notifybyuser',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, hãy thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    
                }
            })
            return;
        }
    }
}])
.service('ChildInfo', ['$http', '$q', 'Api_Path', 'Storage', 'toaster','$filter', 
             function ($http,   $q,    Api_Path,   Storage,   toaster,  $filter) {
	var tran = $filter('translate');
	return{
        // verify
        verify : function(token){
            return $http({
                url: ApiPath + 'access/verifychild/' + token,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
               // console.log(result);
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }
            })
            return;
        }
    }
}])

/**
 * Exchange
 */
.service('Exchange', ['$http', '$q', '$window', 'Api_Path', 'Storage', 'PhpJs', 'toaster','$filter',
             function ($http,   $q,   $window,   Api_Path,    Storage,  PhpJs,  toaster,   $filter) {
	var tran = $filter('translate');
	return{
        // order
        Detail : function(id){
            return $http({
                url: Api_Path.Seller + 'exchange/show?exchange_id=' + id,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }
            })
            return;
        },
        // order
        OrderDetail : function(tracking_code){
            return $http({
                url: Api_Path.Seller + 'order/show?tracking_code=' + tracking_code,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }
            })
            return;
        },

        // Create
        Create : function(data){
            return $http({
                url: Api_Path.Seller+'exchange_create',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', 'Thông báo', PhpJs.convertString(result.message));
                }else{
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        },

        ListExchange : function(page, data, cmd){
            var url = Api_Path.Seller+'exchange?page='+page;

            if(cmd == 'export'){
                url += '&cmd='+cmd;
                $window.open(url, '_blank');
                return '';
            }

            return $http({
                url: url,
                method: "GET",
                params: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', 'Thông báo', PhpJs.convertString(result.message));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        },
        //Change
        Change : function(data){
            return $http({
                url: Api_Path.Seller+'exchange/edit',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), PhpJs.convertString(result.message));
                }else{
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        },
        CreateReturn : function(data){
            return $http({
                url: Api_Path.Seller+'exchange/create-return',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), PhpJs.convertString(result.message));
                }else{
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        }
    }
}])

/**
 * Base
 */
.service('Base', ['$http','$filter', 
        function ($http,   $filter) {
	var tran = $filter('translate');  
    return{
        send_errors: function (url, status, response){
            $http.post(ApiPath+'app/log-error', {
                api_url: url,
                http_status: status,
                body: response,
            }).success(function (){

            });
            return ;
        },
        courier : function(){
            return $http({
                url: ApiUrl + 'api/base/courier',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {

            })

            return;
        },
        list_level_loyalty : function(){
            return $http({
                url: ApiUrl + 'api/base/loyalty-level',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {

            })

            return;
        },
        list_type_case: function () {
            return $http({
                url: ApiUrl + 'api/base/case-type',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {

            })

            return;
        },
        district_by_location: function (){
            return $http({
                url: ApiUrl + 'api/base/district-by-location?location=1',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {

            })
        },
        Status : function(){
            return $http({
                url: ApiUrl + 'api/base/status',
                method: "GET",
                dataType: 'json'
            })

            return;
        },
        Synonyms : function(data){
            return $http({
                url: ApiUrl + 'api/base/synonyms',
                method: "GET",
                params: data,
                dataType: 'json'
            })

            return;
        },
        WareHouse: function() {
            return $http({
                url: ApiUrl + 'api/base/ware-house-boxme',
                method: "GET",
                dataType: 'json'
            }).success(function(result, status, headers, config) {

            }).error(function(data, status, headers, config) {

            })

            return;
        }
    }
}])
.service('Loyalty', ['$http', 'toaster', 'Storage', 'Api_Path', 'PhpJs','$filter',
            function ($http,    toaster, Storage,   Api_Path,    PhpJs,  $filter) {
	var tran = $filter('translate');
    return{
        detail : function(){
            return $http({
                url: Api_Path.Seller+'loyalty',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), PhpJs.convertString(result.error_message));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        },
        list_gift : function(){
            return $http({
                url: Api_Path.Seller+'loyalty/list-gift',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), PhpJs.convertString(result.error_message));
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        },
        Create : function(data){
            return $http({
                url: Api_Path.Seller+'loyalty/create',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })
            return;
        }
    }
}])
.service('Config', ['$http', 'toaster', 'Storage','$filter',
           function ($http,  toaster,    Storage,   $filter) {
	var tran = $filter('translate');
	return{
        send_errors: function (url, status, response){
            $http.post(ApiPath+'app/log-error', {
                api_url: url,
                http_status: status,
                body: response,
            }).success(function (){

            });
            return ;
        },
        load : function(){
            return $http({
                url: ApiUrl + 'api/seller/config/courier-config',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning',tran('toaster_ss_nitifi'), result.error_message);
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            })

            return;
        },
        type_config_courier : function(){
            return $http({
                url: ApiUrl + 'api/seller/base/config-type-courier',
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {

            }).error(function (data, status, headers, config) {

            })

            return;
        },
        active : function(data){
            return $http({
                url: ApiUrl + 'api/seller/config/active-courier',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', 'Thông báo', result.error_message);
                }else{
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
            return;
        },
        priority : function(data){
            return $http({
                url: ApiUrl + 'api/seller/config/priority-courier',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.error_message);
                }else{
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));;
                }
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                   // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
            return;
        }
    }
}])

//service boxme
.service('$alertModal',
	[               '$modal',
		function (   $modal) {
			var modalInstanceController =
				[           '$scope', '$modalInstance', 'title', 'message', 'label',
					function (   $scope,   $modalInstance,   title,   message,   label) {
						$scope.title = title;
						$scope.message = message;
						$scope.label = label;

						$scope.ok = function () {
							$modalInstance.close();
						};
					}
				];
			return {
				show: function (title, message, label, size) {
					return $modal.open({
						templateUrl: 'tpl/ui/alert-modal.html',
						controller: modalInstanceController,
						resolve: {
							title: function () {
								return title;
							},
							message: function () {
								return message;
							},
							label: function () {
								return label || 'OK'
							}
						},
						size: size || 'md',
						backdrop: 'static',
						keyboard: false
					}).result;
				}
			}
		}
	])
	.service('$confirmModal',
	[               '$modal',
		function (  $modal  ) {
			var modalInstanceController =
				[           '$scope', '$modalInstance', 'title', 'question', 'labels',
				function (   $scope,   $modalInstance,   title,   question,   labels) {
					$scope.title = title;
					$scope.question = question;
					$scope.labels = labels;

					$scope.ok = function () {
						$modalInstance.close(true);
					};
					$scope.cancel = function () {
						$modalInstance.dismiss(false);
					};
				}
			];
			return {
				ask: function (title, question, okLabel, cancelLabel, size) {
					return $modal.open({
						templateUrl: 'tpl/ui/confirm-modal.html',
						controller: modalInstanceController,
						resolve: {
							title: function () {
								return title;
							},
							question: function () {
								return question;
							},
							labels: function () {
								return {
									ok: okLabel || 'OK',
									cancel: cancelLabel || 'Cancel'
								}
							}
						},
						size: size || 'md',
						backdrop: 'static',
						keyboard: false
					}).result;
				}
			}
		}
	])
	// LAY DANH SACH KHO BOXE
	app.service('WarehouseRepository',
			['$http','$q', '$timeout','HAL','toaster','$filter',
	function ($http,  $q,   $timeout  ,HAL, toaster,   $filter) {
		var tran = $filter('translate');
		return {
			getListInventory: function() {
				return $http({
                    url: BOXME_API+'inventory_by_seller_V2',
                    method: "GET"
                }).success(function (result) {
                	return result._embedded;
                	//return result.data._embedded;
                }).error(function (data) {
                    if(status == 442){
                    	//toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    	 toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                    	 toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                });
			},
			list: function (type) {
				return $http({
					"url" : BOXME_API+'inventory_by_seller_V2',
					"method" : "GET"
				}).then(function (res){
					return HAL.Collection(res.data);
				});
			},
			//tim 1 kho
			find: function (id) {
				return $http({
					"url" : BOXME_API+'get_inventory_by_seller_V2' + '/' + id,
					"method" : "GET"
				}).then(function (res){
					return HAL.Collection(res.data);
				});
			},
			update : function (inventory) {
				return $http({
					"url" : BOXME_API+'inventory_by_seller_V2',
					"method" : "POST",
					'data': inventory
				}).then(function (res){
					return HAL.Collection(res.data);
				}); 
			},
            GetProducts: function (warehouse_code, display){
                warehouse_code = warehouse_code || "";
                display        = display        || "";
                
                return $http({
					"url" : BOXME_API+'get_list_product_by_seller?warehouse_code=' + warehouse_code + "&display=" + display,
					"method" : "GET"
				}).then(function (res){
					return HAL.Collection(res.data);
				});
            }
		}
	}])
	.service('Datetime', function() {
        // convert date to timestempt
        var stripLeadingZeroes = function(input) {
            if((input.length > 1) && (input.substr(0, 1) == '0')) return input.substr(1);
            else return input;
        };
        var convertStrToNumb = function(strMonth) {
            var objMonths ={1:'Jan', 2:'Feb', 3:'Mar', 4:'Apr', 5:'May', 6:'Jun', 7:'Jul', 8:'Aug', 9:'Sep',10:'Oct', 11:'Nov', 12:'Dec'};
            var respose = null;
            angular.forEach(objMonths, function(str, month) {
                if(str == strMonth) respose = month;
            });
            return respose;
        };
        return {
            /**
             * @return {string}
             */
            DateToTimestempt: function(dateInput) {
                if(dateInput == undefined || dateInput == null|| dateInput == '') {
                    return;
                }
                var strDatetime = String(dateInput), aryDate = strDatetime.split(' ');
                var month = convertStrToNumb(aryDate[1]);
                var day = aryDate[2];
                var year = aryDate[3];
                var time = aryDate[4];
                var aryTime = time.split(':');
                var humDate = new Date(Date.UTC(parseInt(year),
                    (stripLeadingZeroes(month) - 1),
                    stripLeadingZeroes(day),
                    stripLeadingZeroes(aryTime[0]),
                    stripLeadingZeroes(aryTime[1]),
                    stripLeadingZeroes(aryTime[2])));
                return String(humDate.getTime() / 1000.0);
            },
            convertDateGMTToDate: function (dateInput) {
                if(dateInput == undefined || dateInput == null|| dateInput == ''){
                    return null;
                }
                var strDatetime = String(dateInput),aryDate = strDatetime.split(' ');
                var month = convertStrToNumb(aryDate[1]);
                var day = aryDate[2];
                var year = aryDate[3];
                return day + '/' + month + '/' + year;
            },
            addNumberZero: function(n) {
                var number = parseInt(n);
                if(number >= 0 && number < 10)
                {
                    return '0' + number;
                }
                else
                {
                    return number;
                }
            },
            /**
             * @return {string}
             */
            TimestempToDateTime : function (UNIX_timestamp, f, type_month) {
                if(UNIX_timestamp==undefined||UNIX_timestamp==null)return null;
                var format = f != undefined && f != null ? f : 'datetime';
                var typeMonth = type_month != undefined && type_month != null ? type_month : 'string';
                var timeStamp = new Date(UNIX_timestamp * 1000);
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                var year = timeStamp.getFullYear();

                var month = typeMonth == 'string' ? months[timeStamp.getMonth()] : timeStamp.getMonth();
                if(typeMonth == 'number'){
                    month = this.addNumberZero(month);
                }
                var date = timeStamp.getDate();
                date = this.addNumberZero(date);
                year = this.addNumberZero(year);
                var hour = timeStamp.getHours();
                hour = this.addNumberZero(hour);
                var min = timeStamp.getMinutes();
                min = this.addNumberZero(min);

                if(format == 'date') {
                    return date + '/' + month + '/' + year;
                }
                else if(format == 'datetime') {
                    return date + '/' + month + '/' + year + ' ' + hour + ':' + min ;
                }
            },

            /**
             * @return {string}
             */
            TimeDifference: function(unix_timestamp) {
                var difference_in_seconds = (Math.round((new Date()).getTime() / 1000)) - unix_timestamp,
                    current_date = new Date(unix_timestamp * 1000), minutes, hours, days, months;
                var _second = 60, _minute = _second * 60, _day = _minute * 24, _month = _day * 30, _year = _month * 12; // init unit time

                if (difference_in_seconds < _second) {
                    return difference_in_seconds + ' second' + _plural(difference_in_seconds) + ' ago';
                } else if (difference_in_seconds < _minute) {
                    minutes = Math.floor(difference_in_seconds / 60);
                    return minutes + ' minute' + _plural(minutes) + ' ago';
                } else if (difference_in_seconds < _day) {
                    hours = Math.floor(difference_in_seconds / 60 / 60);
                    return hours + ' hour' + _plural(hours) + ' ago';
                } else if(difference_in_seconds < _month) {
                    days = Math.floor(difference_in_seconds / 60 / 60/ 24);
                    return days + ' day' + _plural(days) + ' ago';
                } else if(difference_in_seconds < _year) {
                    months = Math.floor(difference_in_seconds / 60 / 60/ 24/ 30);
                    return months + ' month' + _plural(months) + ' ago';
                } else if (difference_in_seconds > _year) {
                    if (current_date.getYear() !== new Date().getYear()) {
                        return current_date.getDate() + '/' + (current_date.getMonth() + 1) + '/' + _fourdigits(current_date.getYear()) + ' ' + current_date.getHours() + ':' + current_date.getMinutes();
                    }
                    return current_date.getDate() + '/' + (current_date.getMonth() + 1);
                }

                return difference_in_seconds;

                function _fourdigits(number) {
                    return (number < 1000) ? number + 1900 : number;
                }

                function _plural(number) {
                    if (parseInt(number) === 1) {
                        return '';
                    }
                    return 's';
                }
            }
        }
    })
	.service('HAL', function () {

		// Represents a HAL Resource
		var convertResource = function (data) {

			var halFields = ['_links', '_embedded'];

			data.embedded = function () {
				return data['_embedded'];
			};

			data.links   = function () {
				return data['_links'];
			};

			data.linkOf = function (entity) {
				entity = entity || 'self';
				return data['_links'][entity];
			};

			data.get = function (field, defaultValue) {
				if (halFields.indexOf(field) >= 0) {
					return defaultValue;
				}

				return data[field] || defaultValue;
			};

			return data;
		};

		// Represents a HAL Collection Resource
		var convertCollection = function (data) {

			var baseResource = convertResource(data);

			baseResource.totalPage = function () {
				return baseResource['page_count'];
			};

			baseResource.totalItems = function () {
				return baseResource['total_items'];
			};

			baseResource.pageSize = function () {
				return baseResource['page_size'];
			};

			baseResource.listOf = function (field) {
				return baseResource.embedded()[field] || [];
			};

			return baseResource;
		};

		return {
			Collection: convertCollection,
			Resource: convertResource
		}
	})
	.service('$confirmModal',
	[               '$modal',
		function (  $modal  ) {
			var modalInstanceController =
				[           '$scope', '$modalInstance', 'title', 'question', 'labels',
				function (   $scope,   $modalInstance,   title,   question,   labels) {
					$scope.title = title;
					$scope.question = question;
					$scope.labels = labels;

					$scope.ok = function () {
						$modalInstance.close(true);
					};
					$scope.cancel = function () {
						$modalInstance.dismiss(false);
					};
				}
			];
			return {
				ask: function (title, question, okLabel, cancelLabel, size) {
					return $modal.open({
						templateUrl: 'tpl/ui/confirm-modal.html',
						controller: modalInstanceController,
						resolve: {
							title: function () {
								return title;
							},
							question: function () {
								return question;
							},
							labels: function () {
								return {
									ok: okLabel || 'OK',
									cancel: cancelLabel || 'Cancel'
								}
							}
						},
						size: size || 'md',
						backdrop: 'static',
						keyboard: false
					}).result;
				}
			}
		}
	])
    app.service('CurencyExchange', ['$http', '$q', 'Api_Path', 'Storage', 'toaster','$filter', 
             function ($http,   $q,    Api_Path,   Storage,   toaster,  $filter) {
    	var tran = $filter('translate');
    	return{
            getExchange : function(){
                return $http({
                   // url         :'https://seller.shipchung.vn/api/public/api/v1/shopify/order-by-id',
                   url         : ApiPath + 'app/exchange-to-curency-id/1',
                    method      : "GET",
                    dataType    : 'json'
                }).success(function (result, status, headers, config) {
                }).error(function (data, status, headers, config) {

                })
                return;
            }
            
        }
    }]) 
    app.service('StoreConnect', ['$http', '$q', 'Api_Path', 'Storage', 'toaster', '$filter', '$rootScope', '$window',
    function ($http, $q, Api_Path, Storage, toaster, $filter, $rootScope, $window) {
        var tran = $filter('translate');
        return {
            getOrder: function (params) {
                return $http({
                    //url         :'https://seller.shipchung.vn/api/public/api/v1/woocommerce/order-by-store-id',
                    url: ApiPath + 'store/order-store-connect',
                    method: "GET",
                    dataType: 'json',
                    params: params
                }).success(function (result, status, headers, config) {
                    if (result.error) {
                        return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                }).error(function (data, status, headers, config) {
                    return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                })
                return;
            },
            postImportAll: function (params) {
                return $http({
                    //url         :'https://seller.shipchung.vn/api/public/api/v1/woocommerce/order-by-store-id',
                    url: ApiPath + 'store/import-all',
                    method: "POST",
                    dataType: 'json',
                    data: params
                }).success(function (result, status, headers, config) {
                    if (result.error) {
                        return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                }).error(function (data, status, headers, config) {
                    return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                })
                return;
            },
            DownloadExcel: function (data) {
                var url = ApiPath + 'store/download-excel?access_token=' + $rootScope.userInfo.token;
                if (data.data != undefined && data.data != '') {
                    url += '&data=' + data.data;
                }
                if (data.store != undefined && data.store != '') {
                    url += '&store=' + data.store;
                }
                $window.open(url, '_blank');
                return '';
            },
            SyncOrder: function (store_id) {
                return $http({
                    //url         :'https://seller.shipchung.vn/api/public/api/v1/woocommerce/order-by-store-id',
                    url: ApiPath + 'add-order-store-connect/'+store_id,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if (result.error) {
                        return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                }).error(function (data, status, headers, config) {
                    return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                })
                return;
            },
            


        }
    }])   

    app.service('StoreOrderConnect', ['$http', '$q', 'Api_Path', 'Storage', 'toaster', '$filter', '$rootScope', '$window',
    function ($http, $q, Api_Path, Storage, toaster, $filter, $rootScope, $window) {
        var tran = $filter('translate');
        return {
            getSyncOrder: function(params,page){
                return $http({
                    //url         :'https://seller.shipchung.vn/api/public/api/v1/woocommerce/order-by-store-id',
                    url: ApiPath + 'store-order/sync-order-connect?page='+page,
                    method: "GET",
                    dataType: 'json',
                    params: params
                }).success(function (result, status, headers, config) {
                    if (result.error) {
                        return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                }).error(function (data, status, headers, config) {
                    return toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                })
                return;
            },
            ChangeExcel : function(data,key){
                return $http({
                    url: ApiPath + 'store-order/changelog/'+key,
                    method: "POST",
                    data:data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                        //toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            RemoveExcel : function(key){
                return $http({
                    url: ApiPath+'store-order/removelog/'+key,
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                       // toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Thất bại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDuLieuLoi'));
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                        //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
            CreateExcel : function(id,stock_id, checking, post_office, accept, is_global){
                var url = ApiPath+'store-order/createorder/' + id + '?stock_id='+stock_id;
                if(is_global){
                    var url = Api_Path+'store-order/createorderglobal/' + id + '?stock_id='+stock_id;    
                }
                if(checking){
                    url +=  '&checking='+checking;
                }
                if(post_office){
                    url +=  '&post_office=true';
                }
                if(accept){
                    url +=  '&accept='+accept;
                }


                return $http({
                    url: url, 
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                        //toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    }else{
                        toaster.pop('warning',tran('toaster_ss_nitifi'), result.message);
                    }
                }).error(function (data, status, headers, config) {
                    if(status == 440){
                        Storage.remove();
                    }else{
                       // toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                })
                return;
            },
        }

    }])
;

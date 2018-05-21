/*
* TechnoRiver Web Barcode Font
*
* Copyright (c) TechnoRiver Pte Ltd (http://www.technoriversoft.com)
* All Rights Reserved.
*
*
* http://www.technoriversoft.com
*
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var net;
(function (net) {
    (function (technoriver) {
        var Code128Auto = (function (_super) {
            __extends(Code128Auto, _super);
            function Code128Auto(data) {
                _super.call(this, data, false);
            }
            Code128Auto.prototype.encode = function () {
                var cd = "";
                var Result = "";
                var shiftdata = "";

                var filtereddata = this.filterInput(this.data);

                var filteredlength = filtereddata.length;
                if (filteredlength > 254) {
                    filtereddata = filtereddata.substr(0, 254);
                }

                this.technoriver_human_readable_text = this.html_escape(filtereddata);

                if (this.detectAllNumbers(filtereddata) == 0) {
                    filtereddata = this.addShift(filtereddata);
                    cd = this.generateCheckDigit_Code128ABAuto(filtereddata);

                    filtereddata = this.getAutoSwitchingAB(filtereddata);

                    filtereddata = filtereddata + cd;
                    Result = filtereddata;

                    var startc = 236;
                    var stopc = 238;
                    Result = String.fromCharCode(startc) + Result + String.fromCharCode(stopc);
                } else {
                    cd = this.generateCheckDigit_Code128CAuto(filtereddata);
                    var lenFiltered = filtereddata.length;

                    for (var x = 0; x < lenFiltered; x = x + 2) {
                        var tstr = filtereddata.substr(x, 2);
                        var num = parseInt(tstr, 10);
                        Result = Result + this.getCode128CCharacterAuto(num);
                    }

                    Result = Result + cd;
                    startc = 237;
                    stopc = 238;
                    Result = String.fromCharCode(startc) + Result + String.fromCharCode(stopc);
                }

                //Result = this.html_decode(this.html_escape(Result));
                Result = this.html_escape(Result);
                return Result;
            };

            Code128Auto.prototype.getCode128ABValueAuto = function (inputchar) {
                var returnvalue = 0;

                if ((inputchar <= 31) && (inputchar >= 0))
                    returnvalue = (inputchar + 64);
                else if ((inputchar <= 127) && (inputchar >= 32))
                    returnvalue = (inputchar - 32);
                else if (inputchar == 230)
                    returnvalue = 98;
                else
                    returnvalue = -1;

                return returnvalue;
            };

            Code128Auto.prototype.getCode128ABCharacterAuto = function (inputvalue) {
                if ((inputvalue <= 94) && (inputvalue >= 0))
                    inputvalue = inputvalue + 32;
                else if ((inputvalue <= 106) && (inputvalue >= 95))
                    inputvalue = inputvalue + 100 + 32;
                else
                    inputvalue = -1;

                return String.fromCharCode(inputvalue);
            };

            Code128Auto.prototype.getCode128CCharacterAuto = function (inputvalue) {
                if ((inputvalue <= 94) && (inputvalue >= 0))
                    inputvalue = inputvalue + 32;
                else if ((inputvalue <= 106) && (inputvalue >= 95))
                    inputvalue = inputvalue + 32 + 100;
                else
                    inputvalue = -1;

                return String.fromCharCode(inputvalue);
            };

            Code128Auto.prototype.filterInput = function (data) {
                var Result = "";
                var datalength = data.length;
                for (var x = 0; x < datalength; x++) {
                    if (data.charCodeAt(x) >= 0 && data.charCodeAt(x) <= 127) {
                        Result = Result + data.substr(x, 1);
                    }
                }

                return Result;
            };

            Code128Auto.prototype.generateCheckDigit_Code128ABAuto = function (data) {
                var datalength = 0;
                var Sum = 104;
                var Result = -1;
                var strResult = "";

                datalength = data.length;

                var num = 0;
                var Weight = 1;

                var x = 0;
                while (x < data.length) {
                    num = this.ScanAhead_8orMore_Numbers(data, x);
                    if (num >= 8) {
                        var endpoint = x + num;

                        var BtoC = 99;
                        Sum = Sum + (BtoC * (Weight));
                        Weight = Weight + 1;

                        while (x < endpoint) {
                            num = parseInt(data.substr(x, 2), 10);
                            Sum = Sum + (num * (Weight));
                            x = x + 2;
                            Weight = Weight + 1;
                        }
                        var CtoB = 100;
                        Sum = Sum + (CtoB * (Weight));
                        Weight = Weight + 1;
                    } else {
                        num = data.charCodeAt(x);
                        Sum = Sum + (this.getCode128ABValueAuto(num) * (Weight));
                        x = x + 1;
                        Weight = Weight + 1;
                    }
                }
                Result = Sum % 103;
                strResult = this.getCode128ABCharacterAuto(Result);
                return strResult;
            };

            Code128Auto.prototype.getCode128CCharacter = function (inputvalue) {
                if ((inputvalue <= 94) && (inputvalue >= 0))
                    inputvalue = inputvalue + 32;
                else if ((inputvalue <= 106) && (inputvalue >= 95))
                    inputvalue = inputvalue + 32 + 100;
                else
                    inputvalue = -1;

                return String.fromCharCode(inputvalue);
            };

            Code128Auto.prototype.generateCheckDigit_Code128CAuto = function (data) {
                var datalength = 0;
                var Sum = 105;
                var Result = -1;
                var strResult = "";

                datalength = data.length;

                var x = 0;
                var Weight = 1;
                var num = 0;

                for (x = 0; x < data.length; x = x + 2) {
                    num = parseInt(data.substr(x, 2), 10);
                    Sum = Sum + (num * Weight);
                    Weight = Weight + 1;
                }

                Result = Sum % 103;
                strResult = this.getCode128CCharacter(Result);
                return strResult;
            };

            Code128Auto.prototype.OptimizeNumbers = function (data, x, strResultX, num) {
                var BtoC = String.fromCharCode(231);
                var strResult = strResultX + BtoC;

                var endpoint = x + num;
                while (x < endpoint) {
                    var twonum = parseInt(data.substr(x, 2), 10);
                    strResult = strResult + this.getCode128CCharacterAuto(twonum);
                    x = x + 2;
                }

                var CtoB = String.fromCharCode(232);
                strResult = strResult + CtoB;
                return strResult;
            };

            Code128Auto.prototype.ScanAhead_8orMore_Numbers = function (data, x) {
                var numNumbers = 0;
                var exitx = 0;
                while ((x < data.length) && (exitx == 0)) {
                    var barcodechar = data.substr(x, 1);
                    var barcodevalue = barcodechar.charCodeAt(0);
                    if (barcodevalue >= 48 && barcodevalue <= 57)
                        numNumbers = numNumbers + 1;
                    else
                        exitx = 1;

                    x = x + 1;
                }
                if (numNumbers > 8) {
                    if (numNumbers % 2 == 1)
                        numNumbers = numNumbers - 1;
                }
                return numNumbers;
            };

            Code128Auto.prototype.getAutoSwitchingAB = function (data) {
                var datalength = 0;
                var strResult = "";
                var shiftchar = String.fromCharCode(230);

                datalength = data.length;
                var barcodechar = "";
                var x = 0;

                for (x = 0; x < datalength; x++) {
                    barcodechar = data.substr(x, 1);
                    var barcodevalue = barcodechar.charCodeAt(0);

                    if (barcodevalue == 31) {
                        barcodechar = String.fromCharCode(barcodechar.charCodeAt(0) + 96 + 100);
                        strResult = strResult + barcodechar;
                    } else if (barcodevalue == 127) {
                        barcodechar = String.fromCharCode(barcodechar.charCodeAt(0) + 100);
                        strResult = strResult + barcodechar;
                    } else {
                        var num = this.ScanAhead_8orMore_Numbers(data, x);

                        if (num >= 8) {
                            strResult = this.OptimizeNumbers(data, x, strResult, num);
                            x = x + num;
                            x = x - 1;
                        } else
                            strResult = strResult + barcodechar;
                    }
                }
                return strResult;
            };

            Code128Auto.prototype.detectAllNumbers = function (data) {
                var Result = "";
                var allnumbers = 1;

                var datalength = data.length;

                if (datalength % 2 == 1)
                    allnumbers = 0;
                else {
                    for (var x = 0; x < datalength; x++) {
                        var barcodechar = data.charCodeAt(x);
                        if ((barcodechar <= 57) && (barcodechar >= 48)) {
                        } else
                            allnumbers = 0;
                    }
                }

                return allnumbers;
            };

            Code128Auto.prototype.addShift = function (data) {
                var datalength = 0;
                var strResult = "";
                var shiftchar = String.fromCharCode(230);

                datalength = data.length;

                for (var x = 0; x < datalength; x++) {
                    var barcodechar = data.substr(x, 1);
                    var barcodevalue = barcodechar.charCodeAt(0);
                    if ((barcodevalue <= 31) && (barcodevalue >= 0)) {
                        strResult = strResult + shiftchar;
                        barcodechar = String.fromCharCode(barcodechar.charCodeAt(0) + 96);
                        strResult = strResult + barcodechar;
                    } else
                        strResult = strResult + barcodechar;
                }

                return strResult;
            };
            return Code128Auto;
        })(technoriver.CCBarcode);
        technoriver.Code128Auto = Code128Auto;
    })(net.technoriver || (net.technoriver = {}));
    var technoriver = net.technoriver;
})(net || (net = {}));
//# sourceMappingURL=code128auto.js.map

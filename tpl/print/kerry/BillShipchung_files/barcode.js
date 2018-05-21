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
var net;
(function (net) {
    (function (technoriver) {
        var CCBarcode = (function () {
            function CCBarcode(data, checkDigit) {
                this.newline = "<br>";
                //\\ and \" is treated as 1 char so it need not be unescape
                this.data = this.html_decode(data);
                this.checkDigit = checkDigit;
                this.technoriver_human_readable_text = "";
            }
            CCBarcode.prototype.encode = function () {
                return this.data;
            };

            CCBarcode.prototype.overrideNewLine = function (nl) {
                this.newline = nl;
            };

            CCBarcode.prototype.generateCheckDigit = function (data) {
                return "";
            };

            CCBarcode.prototype.getHRText = function () {
                return this.technoriver_human_readable_text;
            };

            CCBarcode.prototype.filterInput = function (data) {
                return data;
            };

            CCBarcode.prototype.html_escape = function (data) {
                var result = "";
                for (var x = 0; x < data.length; x++) {
                    result = result + "&#" + data.charCodeAt(x).toString() + ";";
                }
                return result;
            };

            CCBarcode.prototype.html_decode = function (str) {
                var ta = document.createElement("textarea");
                ta.innerHTML = str.replace(/</g, "&lt;").replace(/>/g, "&gt;"); //so if have a < must replace
                return ta.value;
            };

            CCBarcode.prototype.lengthExceeded2D = function () {
                return 0;
            };
            return CCBarcode;
        })();
        technoriver.CCBarcode = CCBarcode;
    })(net.technoriver || (net.technoriver = {}));
    var technoriver = net.technoriver;
})(net || (net = {}));
//# sourceMappingURL=barcode.js.map

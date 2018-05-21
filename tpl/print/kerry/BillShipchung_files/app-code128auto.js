var Code128Auto = net.technoriver.Code128Auto;

window.onload = function () {
    var elementBarcode = document.getElementsByClassName("barcodeVal");
    for (var x = 0; x < elementBarcode.length; x++) {
        var barcode = new Code128Auto(elementBarcode[x].innerHTML);
        var result = barcode.encode();
        var hrText = barcode.getHRText();
        elementBarcode[x].innerHTML = result;
        var elementHumanReadableText = document.getElementsByClassName("humanReadable");
        elementHumanReadableText[x].innerHTML = hrText;
    }
};
//# sourceMappingURL=app-code128auto.js.map

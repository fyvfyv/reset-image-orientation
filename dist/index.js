"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get orientation code from image file
 *
 * @param {File} file
 * @param {Function} callback — receive a code of orientation
 */
var getOrientation = function (file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
        var view = new DataView(reader.result);
        if (view.getUint16(0, false) !== 0xFFD8) {
            return cb(-2);
        }
        var length = view.byteLength;
        var offset = 2;
        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker === 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    return cb(-1);
                }
                var little = view.getUint16(offset += 6, false) === 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        return cb(view.getUint16(offset + (i * 12) + 8, little));
                    }
                }
            }
            else if ((marker & 0xFF00) !== 0xFF00) {
                break;
            }
            else {
                offset += view.getUint16(offset, false);
            }
        }
        return cb(-1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
};
/**
 * Orient image and execute callback with base64 param
 *
 * @param {File} file
 * @param {Function} callback — receive a base64 image param
 */
var resetOrientation = function (file, callback) {
    var img = new Image();
    var reader = new FileReader();
    reader.readAsDataURL(file);
    img.onload = function () {
        var width = img.width;
        var height = img.height;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        // set proper canvas dimensions before transform & export
        getOrientation(file, function (srcOrientation) {
            if (srcOrientation > 4 && srcOrientation < 9) {
                canvas.width = height;
                canvas.height = width;
            }
            else {
                canvas.width = width;
                canvas.height = height;
            }
            // transform context before drawing image
            switch (srcOrientation) {
                case 2:
                    ctx && ctx.transform(-1, 0, 0, 1, width, 0);
                    break;
                case 3:
                    ctx && ctx.transform(-1, 0, 0, -1, width, height);
                    break;
                case 4:
                    ctx && ctx.transform(1, 0, 0, -1, 0, height);
                    break;
                case 5:
                    ctx && ctx.transform(0, 1, 1, 0, 0, 0);
                    break;
                case 6:
                    ctx && ctx.transform(0, 1, -1, 0, height, 0);
                    break;
                case 7:
                    ctx && ctx.transform(0, -1, -1, 0, height, width);
                    break;
                case 8:
                    ctx && ctx.transform(0, -1, 1, 0, 0, width);
                    break;
                default: break;
            }
            // draw image
            if (ctx) {
                ctx.drawImage(img, 0, 0);
            }
            // export base64
            callback(canvas.toDataURL());
        });
    };
    reader.onloadend = function () {
        img.src = reader.result;
    };
};
exports.default = resetOrientation;

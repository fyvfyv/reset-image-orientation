'use strict';

var getOrientation = (file, callback) => {
    var reader = new FileReader()
  
    reader.onload = function (event) {
        var view = new DataView(event.target.result)
  
        if (view.getUint16(0, false) !== 0xFFD8) {
            return callback(-2)
        }
    
        var length = view.byteLength
        var offset = 2
    
        while (offset < length) {
            var marker = view.getUint16(offset, false)
            offset += 2
    
            if (marker === 0xFFE1) {
                
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    return callback(-1)
                }
            
                var little = view.getUint16(offset += 6, false) === 0x4949
                offset += view.getUint32(offset + 4, little)
                var tags = view.getUint16(offset, little)
                offset += 2
    
                for (var i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        return callback(view.getUint16(offset + (i * 12) + 8, little))
                    }
                }
            } else if ((marker & 0xFF00) !== 0xFF00) {
                break
            } else {
                offset += view.getUint16(offset, false)
            }
      }
      return callback(-1)
    }
  
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024))
}

/**
 * Orient image and execute callback with base64 param
 *
 * @param {File} file
 * @param {string} srcBase64
 * @param {Function} callback — receive a base64 image param
 */
var resetOrientation = (file, srcBase64, callback) => {
    const img = new Image()
  
    img.onload = function () {
        const width = img.width
        const height = img.height
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
  
        // set proper canvas dimensions before transform & export
        getOrientation(file, (srcOrientation) => {
            if (srcOrientation > 4 && srcOrientation < 9) {
                canvas.width = height
                canvas.height = width
            } else {
                canvas.width = width
                canvas.height = height
            }
    
            // transform context before drawing image
            switch (srcOrientation) {
                case 2: ctx.transform(-1, 0, 0, 1, width, 0); break
                case 3: ctx.transform(-1, 0, 0, -1, width, height); break
                case 4: ctx.transform(1, 0, 0, -1, 0, height); break
                case 5: ctx.transform(0, 1, 1, 0, 0, 0); break
                case 6: ctx.transform(0, 1, -1, 0, height, 0); break
                case 7: ctx.transform(0, -1, -1, 0, height, width); break
                case 8: ctx.transform(0, -1, 1, 0, 0, width); break
                default: break
            }
    
            // draw image
            ctx.drawImage(img, 0, 0)
    
            // export base64
            callback(canvas.toDataURL())
        })
    }
    
    img.src = srcBase64
}

module.exports = resetOrientation

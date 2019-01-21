// Load a text Resources from a file over the network
class util {

    static loadTextResourceFromFile(url, callback) {
        let request = new XMLHttpRequest();
        request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                callback('Error: HTTP Status ' + request.status + ' on Resources ' + url);
            } else {
                callback(null, request.responseText);
            }
        };
        request.send();
    };

    static loadImage(url, callback) {
        let image = new Image();
        image.onload = function () {
            callback(null, image);
        };
        image.src = url;
    };

    static loadJSONResource(url, callback) {
        util.loadTextResourceFromFile(url, function (err, result) {
            if (err) {
                callback(err);
            } else {
                try {
                    callback(null, JSON.parse(result));
                } catch (e) {
                    callback(e);
                }
            }
        });
    };

    static resizeCanvas(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    static extractFilename(filepath) {
        return filepath.substring(filepath.lastIndexOf('/') + 1, filepath.length);
    };

    static extractFilenameWithoutExtension(filepath) {
        filepath = extractFilename(filepath);
        return filepath.substring(0, filepath.lastIndexOf('.'));
    };

    static randomStringGenerator(stringLength){
        if(isNaN(stringLength))
            throw new Error("Length given is not a number!");
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < stringLength; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
}

module.exports = util;
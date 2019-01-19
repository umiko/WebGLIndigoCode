// Load a text resource from a file over the network
const loadTextResourceFromFile = function (url, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
    request.onload = function () {
        if (request.status < 200 || request.status > 299) {
            callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
        } else {
            callback(null, request.responseText);
        }
    };
    request.send();
};

const loadImage = function (url, callback) {
    let image = new Image();
    image.onload = function () {
        callback(null, image);
    };
    image.src = url;
};

const loadJSONResource = function (url, callback) {
    loadTextResourceFromFile(url, function (err, result) {
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

const resizeCanvas = function(canvas){
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
};

const extractFilename = function (filepath) {
    return filepath.substring(filepath.lastIndexOf('/')+1, filepath.length);
};

const extractFilenameWithoutExtension = function (filepath) {
    filepath = extractFilename(filepath);
    return filepath.substring(0, filepath.lastIndexOf('.'));
};
/**
 * Node.JS server sample file for the cool ajax file uploader by Valums (http://valums.com/ajax-upload/).
 *
 * You have to install additional modules with:
 * npm install express
 * npm install node-uuid
 *
 * If you are using NginX as reverse proxy, please set this in your server block:
 * client_max_body_size    200M;
 *
 * You have to run the server endpoint on port 80,
 * either by an reverse proxy upstream to this script
 * or by run this script directly on port 80,
 * because the ajax upload script can not handle port instruction in the action url correctly. :(
 *
 * @Author: Felix Gertz <dev@felixgertz.de> 2012
 */

var express = require('express'),
    fs = require('fs'),
    util = require('util'),
    uuid = require('node-uuid'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    multer  = require('multer'),
    gm = require('gm');
    app = express();

// Settings
var settings = {
    node_port: process.argv[2] || 3000,
    uploadpath: __dirname + '/uploads/'
};

// Configuration

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

var filenameCount = 0;
app.use(express.static(__dirname + '/public'));
app.use(
    multer({
            dest: __dirname + '/public/uploads/',
            rename: function (fieldname, filename) {
                return  ++filenameCount ;
            }
        })
);

app.post('/upload', function(req, res) {
    var ext = req.files.upImage.extension,
        fName = filenameCount  + '.' + ext,
        newName = filenameCount + '.png',
        path = __dirname + '/public/uploads/';

    new RegExp('png').test(ext) || moveFile( path + fName, path + newName, function( arg ){ arg && console.log(arg); })
    res.setHeader( 'content-type', 'text/javascript' );
    res.send( {status:200, url:'uploads/' + newName} );
});

app.post('/crop', function(req, res) {
    var body = req.body;
    var url = body.imageUrl,
        cropName = url.replace(/\./, '_crop.');
        path = __dirname + '/public/',
        x1 = body.x1, y1 = body.y1,
        x2 = body.x2, y2 = body.y2,
        width = x2 -x1, height = y2 - y1;

    gm( path + url).crop( width, height, x1, y1)
    .options({imageMagick: true})
    .write(path + cropName, function (err) {
        if (err) {
            console.log( err );
        }else {
            res.send({ status:200, url:cropName });
        }
    });
});


var moveFile = function(source, dest, callback) {
    var is = fs.createReadStream( source )

    is.on('error', function(err) {
        console.log('moveFile() - Could not open readstream.');
        callback('Sorry, could not open readstream.')
    });

    is.on('open', function() {
        var os = fs.createWriteStream(dest);

        os.on('error', function(err) {
            console.log('moveFile() - Could not open writestream.');
            callback('Sorry, could not open writestream.');
        });

        os.on('open', function() {
            util.pump(is, os, function() {
                fs.unlink( source, function (err) {
                    if (err) throw err;
                    console.log('successfully deleted '+ source);
                });
            });

            callback();
        });
    });
};
// Starting the express server
app.listen(settings.node_port, '127.0.0.1');
console.log("Express server listening on %s:%d for uploads", '127.0.0.1', settings.node_port);
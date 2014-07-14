var express = require('express'),
    app = express();


app.use(express.static(__dirname + '/public'));


app.post('/upload', function(req, res) {
    // Get the temporary location of the file
    var tmp_path = req.files.thumbnail.path;

    fs.readFile(req.files.displayImage.path, function (err, data) {
        // ...
        var newPath = __dirname + "/uploads/uploadedFileName";
        fs.writeFile(newPath, data, function (err) {
            res.redirect("back");
        });
    });
});


app.listen(3000);
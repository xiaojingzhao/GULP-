var express = require('express');
var app = express();
var PORT = process.env.PORT || 4000;

app.use("/", express.static('dist/views'));
app.use("/css", express.static('dist/css'));
app.use("/js", express.static('dist/js'));

app.listen(PORT, function () {
    console.log("Running app listening on port ", PORT);
});
var express = require('express');
var app = express();

app.route('/home')
.get(function (req, res) {
  res.sendFile(process.cwd() + '/views/home.html');
})

app.get("/",function (req, res) {
  res.send("Hello world");
})

// Respond not found to all the wrong routes
app.use(function (req, res, next) {
res.status(404);
res.type('txt').send('Not found');
});

// Error Middleware
app.use(function (err, req, res, next) {
if (err) {
  res.status(err.status || 500)
    .type('txt')
    .send(err.message || 'SERVER ERROR');
}
})

module.exports = app;
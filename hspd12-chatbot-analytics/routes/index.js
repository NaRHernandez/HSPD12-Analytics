var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


path = require('path'),
  app = express();

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

module.exports = router;

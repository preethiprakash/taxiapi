var express = require('express');
var router = express.Router();
var pg = require("pg");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/taxi/',require('./users'));
router.use('/get/:_id',require('./users'));
router.use('/taxi/:_id',require('./users'));
router.use('/delete/:_id',require('./users'));
router.use('/user/',require('./users'));
router.use('/get_user/:_id',require('./users'));
router.use('/user/:_id',require('./users'));
router.use('/delete_user/:_id',require('./users'));

module.exports = router;
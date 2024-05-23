const express = require('express');
const router = express.Router();
const firebaseAdmin = require('../connection/firebase');
const bucket = firebaseAdmin.storage().bucket();

router.get('/', function(req, res, next) {
  res.render("users", { title: 'Express' });
})


module.exports = router;

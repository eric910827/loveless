const express = require('express');
const router = express.Router();
const firebaseAdmin = require('../connection/firebase');
const bucket = firebaseAdmin.storage().bucket();


router.get('/', async (req, res, next) => {
  const [imageFiles] = await bucket.getFiles({ prefix: 'images/' });
  const [linegraphFiles] = await bucket.getFiles({ prefix: 'linegraph/' });

  // 將 linegraphFiles 映射為一個快速查找表
  const linegraphMap = new Map(linegraphFiles.map(file => [file.name.replace('linegraph/', ''), file]));

  const images = await Promise.all(
    imageFiles.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file.name.toLowerCase()))
    .map(async file => {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      });
      let linegraphUrl = '';
      const linegraphFile = linegraphMap.get(file.name.replace('images/', ''));
      if (linegraphFile) {
        const [lgUrl] = await linegraphFile.getSignedUrl({
          action: 'read',
          expires: '03-09-2491'
        });
        linegraphUrl = lgUrl;
      }
      return { url, name: file.name, linegraphUrl }; // 包含 linegraphUrl 的物件
    })
  );

  res.render('picture.ejs', { images });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const firebaseAdmin = require('../connection/firebase');
const bucket = firebaseAdmin.storage().bucket();

router.get('/', async (req, res, next) => {
  const [files] = await bucket.getFiles({ prefix: 'webimg/' });

  if (files.length === 0) {
    return res.render('getimg.ejs', { imageUrl: null, imageName: null });
  }

  const latestFile = files.sort((a, b) => {
    return new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated);
  })[0];

  const [url] = await latestFile.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  });

  // 从文件路径中提取文件名，去除路径和扩展名
  // 假设文件名格式为 "final_img/V86.png"
  const filePathParts = latestFile.name.split('/');
  const fileNameWithExtension = filePathParts[filePathParts.length - 1];
  const fileName = fileNameWithExtension.split('.')[0]; // 去除扩展名

  // 将带有时间戳的 URL 和提取的文件名传递给视图
  res.render('getimg.ejs', { imageUrl: `${url}&timestamp=${new Date().getTime()}`, imageName: fileName });
});

module.exports = router;

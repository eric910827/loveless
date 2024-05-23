const express = require('express');
const router = express.Router();
const firebaseAdmin = require('../connection/firebase');
const bucket = firebaseAdmin.storage().bucket();

// 假設你有一個名為 images 的集合存儲圖片資訊

router.get('/', async (req, res, next) => {
  const [files] = await bucket.getFiles(); // 獲取存儲桶中的所有文件
  const images = await Promise.all(
    files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file.name.toLowerCase()))
    .map(async file => {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // 設置一個遠期的過期時間
      });
      return { url, name: file.name }; // 返回包含URL和檔名的對象
    })
  );

  res.render('showimg.ejs', { images }); // 將包含圖片URL和檔名的對象數組傳遞給模板
});





module.exports = router;
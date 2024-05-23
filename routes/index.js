var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const sharp = require('sharp');
const firebaseAdmin = require('../connection/firebase');
const bucket = firebaseAdmin.storage().bucket();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
// const fs = require('fs');
const fs = require('fs').promises; // 正確引用


/*midjourney*/
const { Midjourney } = require("midjourney");
require('dotenv').config();

const client = new Midjourney({
  ServerId: process.env.SERVER_ID,
  ChannelId: process.env.CHANNEL_ID,
  SalaiToken: process.env.SALAI_TOKEN,
  Debug: true,
  Ws: true,
});

// 客戶端初始化
client.init().catch(console.error);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

async function selectRandomImageFromDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    if (imageFiles.length === 0) {
      return null; // 或者抛出一个错誤，或者返回默認途徑路徑
    }
    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    return imageFiles[randomIndex];
  } catch (error) {
    console.error('Error selecting random image from directory:', error);
    throw error; // 或者處理錯誤
  }
}

/* POST from the form. */
// req 代表 HTTP 請求，並攜帶了請求相關的信息，如請求頭（headers）、
//請求的 URL、查詢參數、POST 數據、Cookie 等，用於從客戶端到服務器的數據傳遞。
router.post('/generate-image', async function(req, res, next) {
  try 
  {
      const prompt = req.body.value;
     
      const Imagine = await client.Imagine(prompt, (uri, progress) => {
          console.log("loading", uri, "progress", progress);
      });

      if (!Imagine || !Imagine.uri) {
          return res.send("无法生成图片");
      }
      const U1CustomID = Imagine.options?.find((o) => o.label === "U1")?.custom;
      if (!U1CustomID) {
        // return res.send(`<img src="${Imagine.uri}" alt="Generated Image">`);
      }
      // 使用 U1 進行放大
    const Upscale = await client.Custom({
      msgId: Imagine.id,
      flags: Imagine.flags,
      customId: U1CustomID,
      loading: (uri, progress) => {
        console.log("loading", uri, "progress", progress);
      },
    });

    
    const upscaleImageBuffer = await fetch(Upscale.uri).then(res => res.buffer());
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const randomFileName = `${letter}${numbers}.png`;
    const filePath = `images/${randomFileName}`;
    const upscaleBlob = bucket.file(filePath);

    await new Promise((resolve, reject) => {
      const blobStream = upscaleBlob.createWriteStream({
        metadata: {
          contentType: 'image/png',
        },
      });

      blobStream.on('error', err => {
        console.error('上传放大图像至 Firebase 失败', err);
        reject(err);
      });

      blobStream.on('finish', () => {
        // 放大的圖像上傳完成
        resolve();
      });

      blobStream.end(upscaleImageBuffer);
    });




      // 随机选择一个图像从 `/linegraph` 目录
      const lineGraphDirectoryPath = path.join(__dirname, '..', 'linegraph');
      const randomLineGraphImageName = await selectRandomImageFromDirectory(lineGraphDirectoryPath);
      const randomLineGraphImagePath = path.join(lineGraphDirectoryPath, randomLineGraphImageName);
       // 读取随机选中的 linegraph 图像
      const lineGraphImageBuffer = await fs.readFile(randomLineGraphImagePath);
      const lineGraphFileName = `linegraph/${randomLineGraphImageName}`;
      const lineGraphBlob = bucket.file(`linegraph/${randomFileName }`);
      console.log(randomLineGraphImageName);
      await new Promise((resolve, reject) => {
        const blobStream = lineGraphBlob.createWriteStream({
          metadata: {
            contentType: 'image/png',
          },
        });
  
        blobStream.on('error', err => {
          console.error('上傳 linegraph 圖像至 Firebase失敗', err);
          reject(err);
        });
  
        blobStream.on('finish', resolve);
  
        blobStream.end(lineGraphImageBuffer);
      });

      //下載生成的圖像
      const generatedImageBuffer = await fetch(Upscale.uri).then(res => res.buffer());

      const generatedImageBuffer2 = await fetch(Upscale.uri).then(res => res.buffer());

      //背景資料夾的圖片=>為line專屬背景
      const backgroundImagePath = path.join(__dirname, '..','lineimg','3.png');

      //背景資料夾的圖片=>為web專屬背景
      const backgroundImagePath2 = path.join(__dirname, '..','webimg','3.png');

      //折線圖的圖片路徑取得
      const secondForegroundImagePath = path.join(__dirname, '..', 'linegraph', randomLineGraphImageName);

      // 調整line背景圖像尺寸为 450px 宽和 700px 高
      const resizedBackgroundBuffer = await sharp(backgroundImagePath)
          // .resize(450, 700)
          .toBuffer();

      // 調整midjourney的圖像
      const resizedForegroundBuffer = await sharp(generatedImageBuffer)
          .resize(1000 ,1000)
          .toBuffer();

      // 調整web背景圖像尺寸为 
      const resizedBackgroundBuffer2 = await sharp(backgroundImagePath2)
          // .resize(350,500)
          .toBuffer();
     
      
      const resizedForegroundBuffer2 = await sharp(generatedImageBuffer2)
          .resize(950 ,700)
          .toBuffer();

      //420x160 
      const resizedSecondForegroundBuffer = await sharp(secondForegroundImagePath)
          .resize(1050,null) 
          .toBuffer();

      // 调整尺寸後的前景圖像疊加到調整尺寸後的背景圖像上=>line版本的測驗圖
      const mergedImageBuffer = await sharp(resizedBackgroundBuffer)
          .composite([
            { 
              input: resizedForegroundBuffer, 
              left: 15,
              top: 15
              
            },
            { 
              input: resizedSecondForegroundBuffer,
              left: 40,
              top: 1120
            }
        ]).toBuffer();

         //調整尺寸後的前景圖像疊加到調整尺寸後的背景圖像上=>web版本的測驗圖
      const mergedImageBuffer2 = await sharp(resizedBackgroundBuffer2)
          .composite([
            { 
              input: resizedForegroundBuffer2, 
              left: 15,
              top: 97
            }
        ]).toBuffer();


      // 將web版本的測驗圖上傳至firebase storage
      const webPath = `webimg/${randomFileName}`;
      const webblob = bucket.file(webPath);

      await new Promise((resolve, reject) => {
        const blobStream = webblob.createWriteStream({
          metadata: {
            contentType: 'image/png',
          },
        });
  
        blobStream.on('error', err => {
          console.error('上傳web圖像至Firebase失敗', err);
          reject(err);
        });
  
        blobStream.on('finish', () => {
          // 放大的图像上传完成
          resolve();
        });
  
        blobStream.end(mergedImageBuffer2);
      });

      
    



      // 將line版本的測驗圖上傳至firebase storage
      const fileName = `merged-image-${Date.now()}.png`;
      const blob = bucket.file(`final_img/${randomFileName }`);

      // 将合成的图像上传到 Firebase
      const blobStream = blob.createWriteStream({
          metadata: {
              contentType: 'image/png',
          },
      });

      blobStream.on('error', err => {
          console.error('上傳至Firebase失敗', err);
          return res.status(500).send('上傳至 Firebase失敗');
      });

      blobStream.on('finish', () => {
          // 获取上传后的文件访问链接
          blob.getSignedUrl({
              action: 'read',
              expires: '03-09-2491'
          }).then(urls => {
              // res.send(`<img src="${urls[0]}" alt="Merged Image">`);
              res.redirect('http://127.0.0.1:3000/getimg');
          });
      });

      blobStream.end(mergedImageBuffer);
  } catch (error) {
      console.error('服务器错误', error);
      return res.status(500).send("服务器错误");
  }
});

module.exports = router;
//
 

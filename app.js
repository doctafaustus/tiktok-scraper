const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary');
const fs = require('fs');
const cron = require('node-cron');
const express = require('express');


const cloudinarySecret = process.env.PORT ?
  process.env.CLOUDINARY_SECRET : 
  fs.readFileSync(`${__dirname}/private/cloudinary_secret.txt`).toString();

cloudinary.config({ 
  cloud_name: 'dzynqn10l', 
  api_key: '118568662192166', 
  api_secret: cloudinarySecret 
});



const app = express();
app.listen(process.env.PORT || 3000, () => {
  console.log('App running...');

  //cron.schedule('* * * * *', () => {
    console.log('Running tiktok scraper...');
    init();
  //});
});


async function init() {
  const content = await tiktokScraper();
  await uploadToCloudinary(content);
}


async function uploadToCloudinary(content) {
  for (let i = 0; i < 4; i++) {

    const imageID = content[i].id;
    const title = content[i].title;
    const createTime = content[i].createTime;
    const imageLocation = `${__dirname}/scraped-images/${imageID}.jpg`;

    cloudinary.v2.api.resource(`tiktok/${imageID}`, async (err, result) => {
      if (!result) {
        await cloudinary.v2.uploader.upload(imageLocation, 
          { 
            context: `title=${stripSpecialChars(title)}|created=${createTime}|id=${imageID}`,
            folder: 'tiktok', 
            public_id: imageID,
            tags: ['tiktok']
          },
          (error, result) => {
            if (result) console.log(`${imageID} uploaded!`);
          }
        );
      }
    });
  }

  console.log('~~~ Process complete ~~~');
}

function stripSpecialChars(text) {
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
}


async function tiktokScraper() {

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com/@js_bits', { waitUntil: 'load' });

  const data = await page.evaluate(() => document.querySelector('*').outerHTML);
  console.log('DATA', data);
  // await page.$$('.tt-feed .image-card');

  // const content = await page.evaluate(() => {
  //   const dataScript = document.querySelector('#__NEXT_DATA__');
  //   const data = JSON.parse(dataScript.innerHTML);
  //   const items = data.props.pageProps.items;

  //   return items.map(item => {
  //     return { 
  //       id: item.id,
  //       title: item.desc.replace(/\s#.+/, ''),
  //       createTime: `${item.createTime}000`
  //     };
  //   });
  // });

  // // Note that Puppeteer only sees 4 video cards
  // const videoCards = await page.$$('.tt-feed .image-card');
  // for (let i = 0; i < 4; i++) {
  //   await videoCards[i].screenshot({ path: `scraped-images/${content[i].id}.jpg` });  
  // }

  await browser.close();
  return content;
}
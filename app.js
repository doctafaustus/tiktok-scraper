const admin = require('firebase-admin');
const request = require('request');
const $ = require('cheerio');


// Cloudstore config
const serviceAccount = require('./private/serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();


console.log('Running tiktok scraper...');


request('https://urlebird.com/user/js_bits/', (error, response, body) => {
  if (error) return console.log('An error occurred retrieving TikTok data from UrleBird');

  const tiktokData = [];
  const $html = $.load(body);

  $html('.thumb').each(function(i, thumb) {
    const $thumb = $.load(thumb);
    const $image = $thumb('.img img');

    const id = ($thumb('.info + a').attr('href').match(/(\d{19,20})\/$/) || [])[1];
    const img = /^https/.test($image.attr('src')) ? $image.attr('src') : $image.attr('data-src');

    tiktokData.push({ id, img });
  });

  saveToDB(JSON.stringify(tiktokData));
});

function saveToDB(tiktokData) {
  db.collection('tiktok-videos').doc('mainData').set({ tiktokVideos: tiktokData })
  .then(() => {
    console.log('Saved to DB!');
  })
  .catch(e => {
    console.log('Error writing document:', e);
  });
}

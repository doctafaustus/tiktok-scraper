# TikTok Scraper 🎵

## Description 

This app will continuously scrape the @js_bits TikTok profile page and use Puppeteer to capture the first 4 videos. Images and metadata are then uploaded to Cloudinary for use on jsbits-yo.com.

Note that Puppeteer only sees the first 4 videos unless you do some fancy stuff like evaluate the page with an continuous auto-scroll to lazy load the others.

## Limitations
TikTok seems to force the session into a verification page when the request comes via a web server (i.e. Heroku). This issue does not occur when running the app locally so this is best used via a scheduled process like Windows Task Scheduler or Automator.

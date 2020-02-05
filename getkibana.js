process = require('process')
fs = require('fs')

if (process.argv.length < 3 || process.argv.length > 5) {
	    console.log('Usage: getkibana.js  url filename');
	    process.exit(1);
}

var url = process.argv[2];
var output = process.argv[3] + '.png';
var resultoutput =  output + '.json';
var type = process.argv[4];

//console.log(url)

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
	  ignoreHTTPSErrors: true,
	  userDataDir: './cache',
	  args: ['--proxy-server=192.168.10.17:3128', '--no-sandbox']
  });
  const page = await browser.newPage();

  // set viewport
  //await page.setViewport({width: 1920, height: 1080});
  await page.setViewport({width: 1920, height: 1180});

  const ts = Date.now();
  let result = {
	  timestamp: ts,
	  error: false,
	  errorstr: false
  }

  try {
    await page.goto(url, {
      // wait until page is loaded
      waitUntil: 'networkidle0'
    });

    const selector = 'dashboard-viewport-provider';
    const rect = await page.evaluate(selector => {
 	             const element = document.querySelector(selector);
	             if (!element)
		                 return null;
	             const {x, y, width, height} = element.getBoundingClientRect();
	             return {left: x, top: y, width, height, id: element.id};
	         }, selector);

    if (!rect) {
      result.error = true;
      result.errorstr="Failed to find selector";
    } else {
      // take screenshot of the rect containing the dashboard viewport
      const padding = 0;
      await page.screenshot({
    	  path: output,
            clip: {
            x: rect.left - padding,
            y: rect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
          }
      });
    }
  } catch(e) {
    result.error = true;
    result.errorstr=e.toString()
    console.error(e);
  }
  fs.writeFile(resultoutput, JSON.stringify(result), function(err) {});
  await browser.close();
})();

process = require('process')
fs = require('fs')

if (process.argv.length < 3 || process.argv.length > 5) {
	    console.log('Usage: getscreenshot.js  url filename proxy');
	    process.exit(1);
}

var url = process.argv[2];
var output = process.argv[3] + '.png';
var resultoutput =  output + '.json';

var chrome_args = [ '--no-sandbox' ]

if (process.argv.length > 4) {
  chrome_args.push('--proxy-server=' + process.argv[4])
}

const { exit } = require('process');
//console.log(url)

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
	  ignoreHTTPSErrors: true,
	  userDataDir: './cache',
	  args: chrome_args
  });
  const page = await browser.newPage();

  // set viewport
  await page.setViewport({width: 1920, height: 1080});

  const ts = Date.now();
  let result = {
	  timestamp: ts,
	  error: false,
	  errorstr: ''
  }

  try {
	  await page.goto(url, {
		  // wait until page is loaded
		  waitUntil: 'networkidle0'
	  });

	  // take screenshot of the full page (by default it's only of the viewport)
	  await page.screenshot({path: output, fullPage: true});
  } catch(e) {
    result.error = true;
    result.errorstr=e.toString();
    console.error(Date(ts).toString() + ' : ' + process.argv[2] + " : exception : " + e.toString());
  }
  fs.writeFile(resultoutput, JSON.stringify(result), function(err) {});
  await browser.close();
  if (result.error) exit(1);
})();

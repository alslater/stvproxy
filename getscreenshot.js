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
  await page.setViewport({width: 1920, height: 1080});

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

	  // take screenshot of the full page (by default it's only of the viewport)
	  await page.screenshot({path: output, fullPage: true});
  } catch(e) {
    result.error = true;
    result.errorstr=e.toString();
	console.error(e);
  }
  fs.writeFile(resultoutput, JSON.stringify(result), function(err) {});
  await browser.close();
})();

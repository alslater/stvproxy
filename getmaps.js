var process = require('process')
var fs = require('fs')

if (process.argv.length < 3 || process.argv.length > 5) {
	    console.log('Usage: getkibana.js  url filename');
	    process.exit(1);
}

var url = process.argv[2];
var filename = process.argv[3];

console.log(url)

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
	  ignoreHTTPSErrors: true,
	  headless: true,
	  userDataDir: './cache',
	  args: [
		  '--proxy-server=192.168.10.17:3128', 
		  '--proxy-bypass-list=10.130.7.13',
		  '--no-sandbox'
	  ]
	  //args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  // set viewport
  await page.setViewport({width: 1920, height: 1080});
  
  try {
    await page.goto(url, {
      // wait until page is loaded
      waitUntil: 'networkidle0'
    });

    var maptid = await page.evaluate('window.map.getMapTypeId()');

    if (maptid == 'roadmap') {
       fs.writeFile(filename ,'<Result>0</Result>\n', function(err) {});
    }
    else {
       fs.writeFile(filename,'<Result>10</Result>\n', function(err) { console.error(err); });
    }

  } catch(e) {
    fs.writeFile(filename, '<Result>10</Result>\n', function(err) { console.error('exception: ' + e)} ); 
  }
  await browser.close();
})();

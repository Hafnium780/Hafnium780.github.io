Google extension to get Schoology grades  
<sup><sub>_Really only useful if a teacher hides the grade percentages_</sub></sup>  
**Very low security is used when handling API keys, you probably shouldn't use this if you don't know me**

## Installation (Chrome)
https://chrome.google.com/webstore/detail/schoology-grades/pnigmpmnlcomncpbnnpckdigfmonbgnb

## Installation (Firefox)
https://addons.mozilla.org/en-US/firefox/addon/schoology-grades/ (if Firefox 109 is not released yet, see [Manual Installation (Firefox)](#manual-installation-firefox)

## Manual Installation (Chrome)
1) Download **schoology-grades-chrome-1.1.zip**
2) Unzip into a folder
3) Go to **chrome://extensions**
4) Enable developer mode in the top right
5) Drag and drop unzipped folder onto the page
6) Pin the extension to the extension bar

## Manual Installation (Firefox)
1) Download **schoology-grades-firefox-1.1.xpi**
2) Open **about:config**, click "**Accept the Risk and Continue**"
3) Search "manifest", find the row labeled "**extensions.manifestV3.enabled**"
4) If the value next to it is false, click on the double arrow on the right side to enable V3
5) Go to **about:addons**
6) Drag **schoology-grades-firefox-1.1.xpi** onto the page
7) Click "Yes" to install, select the extension and click on permissions
8) Enable **"Access your data for sites in the htt<span>p</span>s://schoology.com domain"**

## Setup
1) Sign into the Schoology site you normally use (**xxxx.schoology.com**)
2) Go to **xxxx.schoology.com/api**
3) Complete the captcha on the Schoology page and click "Reveal Existing Secret" (or "Allow Access" if Schoology Plus is installed)
4) Click on the extension icon
5) Enter the domain of your Schoology home page (**xxxx** in previous steps)

## Use
1) Click on the extension icon
2) Grades will be automatically loaded
3) Click on any course to see grades of each assignment inside it

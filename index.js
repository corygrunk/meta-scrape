const express = require('express')
const app = express()
const getHTML = require('html-get')
const port = 3000


// `browserless` will be passed to `html-get` as driver for getting the rendered HTML
const browserless = require('browserless')()

const getContent = async url => {
  // create a browser context inside the main Chromium process
  const browserContext = browserless.createContext()
  const promise = getHTML(url, { getBrowserless: () => browserContext })
  // close browser resources before return the result
  promise.then(() => browserContext).then(browser => browser.destroyContext())
  return promise
}


//  `metascraper` packages,
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-amazon')(),
  require('metascraper-instagram')(),
  require('metascraper-soundcloud')(),
  require('metascraper-spotify')(),
  require('metascraper-youtube')()
])


// Server request/response
app.get('/', (req, res) => {
  if (req.query.url != null) {
    getContent(req.query.url)
    .then(metascraper)
    .then(metadata => { res.json(metadata) })
    .then(browserless.close)
  } else {
    res.status(400)
    res.send({ 'error' : 'You must provide a url in your request' })
    console.log('Error: You must provide a url in your request')
  }
})

// Server
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

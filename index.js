var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')

var webpage = 'http://musicforprogramming.net'

request(webpage)
  .then(getTrackPages)
  .then(console.log)
  .catch(console.error)

function getTrackPages(html) {
  var $ = cheerio.load(html)

  // Get only the right links and attach them the full URL
  return $('.container .menu a').filter(function () {
    return $(this).text().match(/\d+: .*/g)
  }).map(function () {
    return webpage + $(this).attr('href')
  })
}

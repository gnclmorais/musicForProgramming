'use strict'

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')

var webpage = 'http://musicforprogramming.net'

request(webpage)
  .then(getTrackPages)
  .then(getTrackLinks)
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

function getTrackLinks(pagesUrls) {
  return Promise.all(pagesUrls.map(function (index, page) {
    return request(page)
  }).get()).then(function (pages) {
    return pages.map(extractTrackLink)
  })
}

function extractTrackLink(html) {
  var $ = cheerio.load(html)
  var track = $('.container .content a').first()

  return track.attr('href')
}

function downloadTrack(track) {
  // Try to get a proper name, fallback if fails
  var name = track.match(/\d+-[a-z_]+\.mp3/g)
  name = name ? name[0] : track.split('-')[1]

  return request(track).pipe(fs.createWriteStream(name))
}

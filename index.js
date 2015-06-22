'use strict'

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
//var fs = require('fs')
var fs = Promise.promisifyAll(require('fs'))

var webpage = 'http://musicforprogramming.net'

request(webpage)
  .then(getTrackPages)
  .then(getTrackLinks)
  .then(downloadTracks)
  .then(function () {
    console.log('All done!')
  })
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

function downloadTracks(tracks) {
  return Promise.reduce(tracks, function (total, track) {
    return downloadTrack(track).then(function () {
      return total += 1;
    })
  }, 0)
}

function downloadTrack(track) {
  // Try to get a proper name, fallback if fails
  var name = track.match(/\d+-[a-z_]+\.mp3/g)
  name = name ? name[0] : track.split('-')[1]

  //console.log(track)
  return new Promise(function () {
    return request(track).pipe(fs.createWriteStream(name)).on('end', function () {
      return 'Finish!'
    })
  })
}

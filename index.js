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
      return total + 1
    })
  }, 0) // Is this necessary?
}

function downloadTrack(track) {
  // Try to get a proper name, fallback if fails
  var name = track.match(/\d+-[a-z_]+\.mp3/g)
  name = name ? name[0] : track.split('-')[1]

  // return request(track).then(function (data) {
  //   return fs.writeFileAsync(name, data);
  // }).then(function () {
  //   console.log('Finished downloading ' + name)
  // })

  return new Promise(function (resolve, reject) {
    request(track)
      .on('data', function (chunk) {
        console.log('data')
        // bar = bar || new ProgressBar('Downloading... [:bar] :percent :etas', {
        //   complete: '=',
        //   incomplete: ' ',
        //   width: 25,
        //   total: parseInt(req.response.headers['content-length'])
        // });

        // bar.tick(chunk.length);
      })
      .pipe(fs.createWriteStream(name)
        .on('pipe', function (chunk) {
          console.log('Starting…')
        })
        .on('readable', function (chunk) {
          console.log('Readable…')
        })
        // .on('drain', function (a, b, c) {
        //   console.log('Draining…', a, b, c)
        // })
        .on('data', function (chunk) {
          console.log('Data…')
        })
        .on('write', function (chunk) {
          console.log('Writing')
        })
        .on('finish', function () {
          console.log('Finished downloading ' + name)
          resolve();
        }))
  })
}

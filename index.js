'use strict'

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var ProgressBar = require('progress')

var webpage = 'http://musicforprogramming.net'

/**
 * Main body.
 */
console.log('Fetching page...')
request(webpage)
  .then(getTrackPages)
  .then(getTrackLinks)
  .then(downloadTracks)
  .then(wrapUp)
  .catch(handleError)

/**
 * Requests the pages where to get the tracks.
 * @param  {String} html HTML code of the requested page.
 * @return {Array}       List of page links.
 */
function getTrackPages(html) {
  console.log('Building track pages links...')

  var $ = cheerio.load(html)

  // Get only the right links and attach them the full URL
  return $('.container .menu a').filter(function () {
    return $(this).text().match(/\d+: .*/g)
  }).map(function () {
    return webpage + $(this).attr('href')
  })
}

/**
 * Requests each track page.
 * @param  {Array} pagesUrls List of page links.
 * @return {Promise}         Promise returning an array of mp3 links.
 */
function getTrackLinks(pagesUrls) {
  console.log('Fetching track pages...')

  return Promise.all(pagesUrls.map(function (index, page) {
    return request(page)
  }).get()).then(function (pages) {
    console.log('Extracting track links...')

    return pages.map(extractTrackLink)
  })
}

/**
 * Extrats the mp3 link from a track page.
 * @param  {String} html The HTML of a track page.
 * @return {String}      The track (mp3 file) URL.
 */
function extractTrackLink(html) {
  var $ = cheerio.load(html)
  var track = $('.container .content a').first()

  return track.attr('href')
}

/**
 * Goes through each track and downloads it.
 * @param  {Array} tracks List of track files.
 * @return {Promise}      Promise returning the number of tracks downloaded.
 */
function downloadTracks(tracks) {
  return Promise.reduce(tracks, function (total, track) {
    return downloadTrack(track).then(function () {
      return total + 1
    })
  }, 0)
}

/**
 * Downloads & saves a single track.
 * @param  {String} track The URL of an mp3 track.
 * @return {Promise}      Promise responsible for downloading & saving a track.
 */
function downloadTrack(track) {
  // Try to get a proper name, fallback if fails
  var name = track.match(/\d+-[a-z_]+\.mp3/g)
  name = name ? name[0] : track.split('-')[1]

  return new Promise(function (resolve, reject) {
    var msg, bar

    var handleFileExists = function (a, b) {
      console.log(name + ' exists, skipping download...')
      resolve();
    }

    var handleFileDoesntExist = function () {
      request(track)
        .on('response', function (res) {
          // Create a new progress bar
          msg = 'Downloading ' + name + '... [:bar] :percent :etas'
          bar = new ProgressBar(msg, {
            incomplete: ' ',
            width: 25,
            renderThrottle: 500,
            total: parseInt(res.headers['content-length'], 10)
          })
        })
        .on('data', function (chunk) {
          // Update progress bar
          bar.tick(chunk.length)
        })
        .on('end', resolve)
        .pipe(fs.createWriteStream(name))
    }

    // Check if the file already exists
    fs.statAsync(name)
      .then(handleFileExists)
      .catch(handleFileDoesntExist)
  })
}

/**
 * Final message, after all downloads.
 * @param  {Number} total Total number of downloaded tracks.
 */
function wrapUp(total) {
  total = total || 0
  var num = total === 1 ? '' : 's'
  var msg = 'All done! ' + total + ' file' + num + ' downloaded.'

  console.log(msg)
}

/**
 * Simple error handling, no need to get fancy.
 * @param  {Object} err Error object, with info about what happened.
 */
function handleError(err) {
  console.error('\nSomething happened... Are you connected to the web?')
  console.error('More details:\n', err)
}

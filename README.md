# musicForProgramming
Node.js script to download all [musicForProgramming();](http://musicforprogramming.net/) sessions.

> A series of mixes intended for listening while programming to aid concentration
> and increase productivity (also compatible with other activities).

## Usage
1. Clone the repository and `cd` into it
1. Run `npm install`
1. Run `npm start`

Now this script will try to download all
[musicForProgramming();](http://musicforprogramming.net/) tracks into the
folder you’re in. Simple.

## Sample output
```
gnclmorais at mainfram in ~/dev/repos/musicForProgramming
$ npm start

> musicForProgramming@1.0.0 start /Users/gnclmorais/dev/repos/musicForProgramming
> node index.js

Fetching page...
Building track pages links...
Fetching track pages...
Extracting track links...
Downloading 1-datassette.mp3... [=========================] 100% 0.0s
Downloading 2-sunjammer.mp3... [=========================] 100% 0.0s
Downloading 3-datassette.mp3... [===                      ] 14% 225.7s
```

## Todo
- [x] Use pipes, since files are huge.
- [x] Check if files already exit.
- [x] Better error handling.
- [ ] Use [RSS feed](http://musicforprogramming.net/rss.php) instead of just crawling the website

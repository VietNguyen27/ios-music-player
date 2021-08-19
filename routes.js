const express = require('express');
const fs = require('fs');
const getMp3Duration = require('get-mp3-duration');
const PATH = 'songs';
const songFiles = fs.readdirSync(PATH);
let songList = [];

songFiles.forEach((songFile) => {
  let songObj = {};
  const songFullPath = songFile.slice(0, -4);
  const songInfo = songFullPath.split(' - ');
  const artist = songInfo[0];
  const songName = songInfo[1];
  const buffer = fs.readFileSync(`${PATH}/${songFile}`);
  const duration = (getMp3Duration(buffer) / 1000).toFixed(0);

  songObj.artist = artist;
  songObj.name = songName;
  songObj.audio = songFile;
  songObj.img = songFullPath + '.jfif';
  songObj.duration = duration;

  songList.push(songObj);
});

const router = express.Router();

router.route('/').get((req, res) => {
  const alphabetSongList = songList
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      if (aName > bName) return 1;
      if (aName < bName) return -1;
      return 0;
    })
    .map((song, index) => {
      return {
        ...song,
        id: index,
      };
    });

  res.json(alphabetSongList);
});

module.exports = router;

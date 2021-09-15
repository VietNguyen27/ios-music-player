const minuteEl = document.getElementById('minute');
const hourEl = document.getElementById('hour');
const shuffleBtn = document.getElementById('button-shuffle');
const prevBtn = document.getElementById('button-prev');
const playBtn = document.getElementById('button-play');
const nextBtn = document.getElementById('button-next');
const listBtn = document.getElementById('button-list');
const appendBtn = document.getElementById('button-expand');
const startTime = document.getElementById('start-time');
const endTime = document.getElementById('end-time');
const startScreen = document.querySelector('.phone-start-screen');
const volumeContainer = document.querySelector('.volume-container');
const volumeInput = document.querySelector('.volume-container .volume');
const volumeIcon = document.querySelector('.volume-container span');
const discEl = document.querySelector('.circle-progress img');
const songName = document.querySelector('.music-name');
const songArtist = document.querySelector('.music-artist');
const songAudio = document.querySelector('.music-audio');
const progressBar = document.querySelector('.progress-bar .progress');
const progressInput = document.querySelector('.progress-bar .slider');
const musicFooter = document.querySelector('.music-footer');
const musicList = document.querySelector('.music-list');

const app = {
  songs: [],
  volume: 100,
  currentIndex: 0,
  currentTime: 0,
  isPlaying: false,
  isShuffle: false,
  turnOnMobile() {
    setTimeout(() => {
      startScreen.remove();
    }, 5000);
  },
  async getSongs() {
    const res = await axios.get('/musics');
    this.songs = res.data;
  },
  defineProperties() {
    Object.defineProperty(this, 'currentSong', {
      get() {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents() {
    const _this = this;
    const musicItems = document.querySelectorAll('.music-item button');
    let volumeInterval = null;
    let musicListInterval = null;

    playBtn.addEventListener('click', function () {
      _this.isPlaying ? _this.pauseSong() : _this.playSong();
    });

    prevBtn.addEventListener('click', function () {
      _this.playPrevSong();
    });

    nextBtn.addEventListener('click', function () {
      _this.playNextSong();
    });

    shuffleBtn.addEventListener('click', function () {
      this.classList.toggle('active');
      _this.isShuffle = !_this.isShuffle;

      _this.setAppSettings({ isShuffle: _this.isShuffle });
    });

    listBtn.addEventListener('click', function () {
      musicFooter.classList.toggle('active');
    });

    appendBtn.addEventListener('click', function () {
      volumeContainer.classList.toggle('active');
      clearInterval(volumeInterval);

      if (volumeContainer.classList.contains('active')) {
        volumeInterval = setInterval(function () {
          volumeContainer.classList.remove('active');
          clearInterval(volumeInterval);
        }, 3000);
      }
    });

    musicItems.forEach((musicItem) => {
      musicItem.addEventListener('click', function () {
        const musicId = this.dataset.id;

        if (this.classList.contains('active')) {
          this.classList.remove('active');
          this.innerHTML = '<ion-icon name="play"></ion-icon>';
          _this.currentIndex = Number(musicId);
          _this.pauseSong();
        } else {
          musicItems.forEach((musicItem) => {
            musicItem.classList.remove('active');
            musicItem.innerHTML = '<ion-icon name="play"></ion-icon>';
          });
          this.classList.add('active');
          this.innerHTML = `
            <div class="sound-loader">
              <div class="stroke"></div>
              <div class="stroke"></div>
              <div class="stroke"></div>
            </div>
          `;

          if (_this.currentIndex !== Number(musicId)) {
            _this.currentIndex = Number(musicId);
            _this.loadCurrentSong();
          }
          _this.playSong();
        }
      });
    });

    volumeContainer.addEventListener('mouseover', function () {
      clearInterval(volumeInterval);
    });

    volumeContainer.addEventListener('mouseout', function () {
      volumeInterval = setInterval(function () {
        volumeContainer.classList.remove('active');
        clearInterval(volumeInterval);
      }, 3000);
    });

    volumeInput.addEventListener('change', function () {
      _this.volume = this.value;
      _this.changeVolume(this.value);

      _this.setAppSettings({ volume: Number(this.value) });
    });

    progressInput.addEventListener('change', function () {
      const currentTimeSelect = (_this.currentSong.duration * this.value) / 100;

      songAudio.currentTime = currentTimeSelect;
      _this.changeSongTime(currentTimeSelect, _this.currentSong.duration);
      _this.playSong();
    });

    songAudio.onended = function () {
      _this.playNextSong();
    };

    songAudio.ontimeupdate = function () {
      _this.changeSongTime(songAudio.currentTime, _this.currentSong.duration);
    };

    navigator.mediaSession.setActionHandler('play', function () {
      _this.playSong();
    });

    navigator.mediaSession.setActionHandler('pause', function () {
      _this.pauseSong();
    });
  },
  playSong() {
    const musicItems = document.querySelectorAll('.music-item button');

    this.isPlaying = true;
    songAudio.play();
    playBtn.innerHTML = '<ion-icon name="pause-circle"></ion-icon>';
    discEl.style.animationPlayState = 'running';

    musicItems.forEach((musicItem) => {
      const musicId = Number(musicItem.dataset.id);

      musicItem.classList.remove('active');
      musicItem.innerHTML = '<ion-icon name="play"></ion-icon>';
      if (musicId === this.currentIndex) {
        musicItem.classList.add('active');
        musicItem.innerHTML = `
          <div class="sound-loader">
            <div class="stroke"></div>
            <div class="stroke"></div>
            <div class="stroke"></div>
          </div>
        `;
      }
    });
  },
  playNextSong() {
    if (this.isShuffle) {
      this.currentIndex = this.shuffleSong();
    } else {
      this.currentIndex++;
    }

    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }

    this.currentTime = 0;
    this.setAppSettings({ currentIndex: this.currentIndex });
    this.loadCurrentSong();
    this.playSong();
  },
  playPrevSong() {
    if (this.isShuffle) {
      this.currentIndex = this.shuffleSong();
    } else {
      this.currentIndex--;
    }
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }

    this.currentTime = 0;
    this.setAppSettings({ currentIndex: this.currentIndex });
    this.loadCurrentSong();
    this.playSong();
  },
  pauseSong() {
    const musicItems = document.querySelectorAll('.music-item button');

    this.isPlaying = false;
    songAudio.pause();
    playBtn.innerHTML = '<ion-icon name="play-circle"></ion-icon>';
    discEl.style.animationPlayState = 'paused';

    musicItems.forEach((musicItem) => {
      const musicId = Number(musicItem.dataset.id);

      if (musicId === this.currentIndex) {
        musicItem.classList.remove('active');
        musicItem.innerHTML = '<ion-icon name="play"></ion-icon>';
      }
    });

    this.setAppSettings({ currentTime: songAudio.currentTime });
  },
  setAppSettings(settings) {
    let appSettings = JSON.parse(localStorage.getItem('appSettings'));

    Object.entries(settings).forEach((setting) => {
      const [key, value] = setting;

      appSettings = { ...appSettings, [key]: value };
    });

    localStorage.setItem('appSettings', JSON.stringify(appSettings));
  },
  loadAppSettings() {
    const appSettings = JSON.parse(localStorage.getItem('appSettings'));

    if (appSettings) {
      const { volume, isShuffle, currentIndex, currentTime, currentSong } =
        appSettings;

      this.volume = volume;
      this.isShuffle = isShuffle;
      this.currentIndex = currentIndex;
      this.currentTime = currentTime;
      this.currentSong = currentSong;
      this.isShuffle ? shuffleBtn.classList.add('active') : null;
    } else {
      const appSettings = {
        volume: this.volume,
        isShuffle: this.isShuffle,
        currentIndex: this.currentIndex,
        currentTime: this.currentTime,
        currentSong: this.currentSong,
      };

      localStorage.setItem('appSettings', JSON.stringify(appSettings));
    }
  },
  loadCurrentTime() {
    const today = new Date();
    const minute = today.getMinutes();
    const hour = today.getHours();

    minuteEl.textContent = minute >= 10 ? minute : '0' + minute;
    hourEl.textContent = hour >= 10 ? hour : '0' + hour;

    setTimeout(this.loadCurrentTime.bind(this), 1000);
  },
  loadCurrentSong() {
    const { id, name, artist, audio, img, duration } = this.currentSong;
    const musicItem = document.getElementById(`music-${id}`);
    const posListY = musicList.offsetTop;
    const posItemY = musicItem.offsetTop;

    musicList.scrollTo(0, posItemY - posListY);

    songName.textContent = name;
    songArtist.textContent = artist;
    songAudio.src = `/songs/${audio}`;
    songAudio.currentTime = this.currentTime;
    discEl.src = `/img/${img}`;
    discEl.setAttribute('draggable', false);
    startTime.textContent = '0:00';
    endTime.textContent = this.convertTime(duration);
    progressInput.value = 0;
    progressBar.style.background =
      'linear-gradient(90deg, var(--red-color) 0%, var(--gray-border) 0% )';
    document.title = `${name} - ${artist}`;

    this.changeVolume(this.volume);
    this.setAppSettings({ currentSong: this.currentSong });
  },
  loadSongList() {
    let songList = '';

    this.songs.map((song) => {
      const { id, name, artist, img, duration } = song;

      songList += `
        <div class="music-item" id="music-${id}">
          <div class="music-img">
            <img src="/img/${img}" />
            <button class="button-control" data-id="${id}">
              <ion-icon name="play"></ion-icon>
            </button>
          </div>
          <div class="music-details">
            <div>
              <p>${name}</p>
              <span>${artist}</span>
            </div>
            <span>${this.convertTime(duration)}</span>
          </div>
        </div>
      `;
    });

    musicList.innerHTML = songList;
  },
  changeSongTime(currentTime, duration) {
    const progress = ((currentTime / duration) * 100).toFixed(1);

    startTime.textContent = this.convertTime(currentTime.toFixed(0));
    progressInput.value = progress;
    progressBar.style.background = `linear-gradient(90deg, var(--red-color) ${progress}%, var(--gray-border) ${progress}% )`;
    this.setAppSettings({ currentTime: songAudio.currentTime });
  },
  changeVolume(volume) {
    volumeIcon.style.color = `var(--${volume > 10 ? 'black' : 'white'}-color)`;
    volumeInput.value = volume;
    volumeInput.style.background = `linear-gradient(90deg, var(--white-color) ${volume}%, var(--dark-gray-color) ${volume}% )`;
    songAudio.volume = volume / 100;

    if (volume > 70) {
      volumeIcon.innerHTML = '<ion-icon name="volume-high-outline"></ion-icon>';
    } else if (volume > 40) {
      volumeIcon.innerHTML =
        '<ion-icon name="volume-medium-outline"></ion-icon>';
    } else if (volume > 0) {
      volumeIcon.innerHTML = '<ion-icon name="volume-low-outline"></ion-icon>';
    } else {
      volumeIcon.innerHTML = '<ion-icon name="volume-mute-outline"></ion-icon>';
    }
  },
  convertTime(time) {
    const second = time % 60;

    return `${Math.floor(time / 60)}:${second > 9 ? second : '0' + second}`;
  },
  shuffleSong() {
    const randomSong = Math.floor(Math.random() * this.songs.length);
    if (this.currentIndex === randomSong) {
      this.shuffleSong();
    }
    return randomSong;
  },
  async start() {
    this.turnOnMobile();

    await this.getSongs();

    this.defineProperties();

    this.loadAppSettings();

    this.loadSongList();

    this.handleEvents();

    this.loadCurrentTime();

    this.loadCurrentSong();
  },
};

app.start();

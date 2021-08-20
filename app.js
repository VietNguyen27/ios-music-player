const path = require('path');
const express = require('express');
const musicRoutes = require('./routes');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const router = express.Router();
const __dirnamePath = path.resolve();

app.use(cors());

app.use('/musics', musicRoutes);
app.use('/songs', express.static(path.join(__dirnamePath, '/songs')));
app.use('/img', express.static(path.join(__dirnamePath, '/img')));

app.listen(
  process.env.PORT || 5000,
  console.log(`Server running on port ${PORT}`)
);

const path = require('path');
const express = require('express');
const musicRoutes = require('./routes');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const __dirnamePath = path.resolve();

app.use(cors());

app.use(express.static(path.resolve('./')));
app.use('/musics', musicRoutes);
app.use('/songs', express.static(path.join(__dirnamePath, '/songs')));
app.use('/img', express.static(path.join(__dirnamePath, '/img')));

app.listen(PORT, console.log(`Server running on port ${PORT}`));

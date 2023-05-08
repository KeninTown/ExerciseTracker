const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./User.js') //модель User для MongoDB
const Exercise = require('./Exercises.js');//занятия для каждого чела

const PORT = process.env['PORT']
const MONGO_URI = process.env['MONGO_URI']
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

//Connecting to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected'))
  .catch((err) => console.log(err));

//send start page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//create new user
app.post('/api/users', async (req, res) => {
  const user = new User({
    username: req.body.username
  });
  try {
    let savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  }
  catch (err) {
    console.log(err);
  }
});

//send all users
app.get('/api/users', async (req, res) => {
  try {
    let users = await User.find({}).select('_id username');
    res.send(users);
  }
  catch (err) {
    console.log(err);
  }
});

//create new exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userIdParams = req.params._id;
    let dateBody = req.body.date ? new Date(req.body.date) : new Date();
    const exercise = new Exercise({
      userId: userIdParams,
      duration: req.body.duration,
      description: req.body.description,
      date: dateBody.toDateString(),
      unixDate: dateBody.getTime()
    })
    const savedExercise = await exercise.save();
    const user = await User.findById(userIdParams);
    res.json({
      _id: userIdParams,
      username: user.username,
      duration: savedExercise.duration,
      description: savedExercise.description,
      date: savedExercise.date
    });
  }
  catch (err) {
    console.log(err);
  }
});

//send JSON with information about user with id
app.get('/api/users/:id/logs', async (req, res) => {
  try {
    const userIdParams = req.params.id;
    const user = await User.findById(userIdParams);
    let queryUserExercises = Exercise.find({ userId: req.params.id });

    if (req.query.from && req.query.to) {
      const from = new Date(req.query.from).getTime();
      const to = new Date(req.query.to).getTime();
      queryUserExercises = Exercise.find({
        $and: [
          { userId: userIdParams },
          { unixDate: { $gt: from, $lt: to } }
        ]
      });
    }

    if (req.query.limit)
      queryUserExercises.limit(Number(req.query.limit));

    queryUserExercises.select('description duration date -_id');
    const userExercises = await queryUserExercises.exec();

    res.json({
      _id: user._id,
      username: user.username,
      count: userExercises.length,
      log: userExercises
    });
  }
  catch (err) {
    console.log(err);
  }
})

//прослушиваем порт
const listener = app.listen(PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

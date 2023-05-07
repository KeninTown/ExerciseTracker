const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./User.js') //модель User для MongoDB
// const Exercise = require('./Exercises.js');//занятия для каждого чела


require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false})); //расшифровывать body у post req

//Подключение MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected'))
  .catch((err) => console.log(err));

//отправляем стартовую страницу
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//645795380a02f48d6a70df34

app.post('/api/users', async (req, res) => {
  const user = new User({
    name: req.body.username
  });
  try{
    let savedUser = await user.save();
    res.json({username: savedUser.name, _id: savedUser._id});
  }
  catch(err){
    console.log(err);
  }
});

app.get('/api/users', async (req, res) => {
  try{
    let users = await User.find({});
    res.send(users);
  }
  catch(err){
    console.log(err);
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try{
    const userId = req.params._id;
    // const user = await User.findByIdAndUpdate(userId, {$push: {exercises: {
    //   duration: req.body.duration,
    //   description: req.body.description,
    //   date: new Date(req.body.date).toDateString()
    // }}});
    const reqDuration = Number(req.body.duration);
    const reqDescription = req.body.description;
    const reqDate = new Date(req.body.date).toDateString();
    const user = await User.findById(userId);
    user.exercises.push({
        duration: reqDuration,
        description: reqDescription,
        date: reqDate
    });

    const savedUser = await user.save();
    res.json({
      _id:userId, 
      username: savedUser.name,
      duration: reqDuration,
      description: reqDescription,
      date: reqDate
    });
  }
  catch(err){
    console.log(err);
  }
});

async function as(){
  let user = await User.find({name:'Anastasia'});
  console.log(user);
}
// as();


app.get('/api/users/:id/logs', async (req, res) => {
  try{
    const user = await User.findById(req.params.id);
    if(user)
    {
      res.json({
        _id: user._id,
        username: user.name,
        count: user.exercises.length,
        log: user.exercises
      })
    }
    else{
      res.json({error: 'Wrong user id'})
    }
  }
  catch(err){
    console.log(err);
  }
})

//прослушиваем порт
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


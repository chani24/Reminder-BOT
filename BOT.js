const config = require('./config');
const twitter = require('twitter');
const T = new twitter(config.bot);
const moment = require('moment');
var db;
var CronJob = require('cron').CronJob;


var job = new CronJob('5 23 * * * *', function() {
  getDueReminders();
}, null, true, 'America/Los_Angeles');
job.start();



//database setup
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb+srv://chani:chidera4life@reminder-clients-vapgd.mongodb.net/test?retryWrites=true&w=majority';

// Use connect method to connect to the Server
MongoClient.connect(url,
  {useUnifiedTopology: true}, function(err, client) {
  assert.equal(null, err);

  //test db
  db = client.db("test");
 console.log('connected');
});




/*T.post('statuses/update', {status: ""}, 
(err, tweet, res) => {
    if(!err){
        console.log('Tweet success');
    }else{
        console.log('something went wrong');
    }
});*/




var stream = T.stream('statuses/filter', {track: '@reminderBOT5'});

stream.on('data', function(event) {

  if(!isRetweet(event.text)){
    retweetTweet(event.id_str);
   let actualDate = getDate(event.text);


    //insert into db
    db.collection('users').insertOne({
      user: event.user.screen_name,
      userID: event.user.id,
      date: actualDate,
      tweetID: event.id_str
    })
    .then(function(result) {
      // process result
      console.log('Tweet has been saved');
    }).catch((err)=>console.log(err));
  }
  
});
 
stream.on('error', function(error) {
  console.log(error);
});

const retweetTweet = (ID) => {
  T.post('statuses/retweet/' + ID, function(err, liked, res){
  if(!err){
    console.log('Tweet has been retweeted');
  }else if(err){
    console.log(err);
  }
  })
}


//function that checks if tweet is a retweet
const isRetweet = (tweet) => {
let arr = tweet.split(" ");
return arr[0] === 'RT' ? true : false;
};


//function that retrieves date
const getDate = tweet => {
let regex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
let arr = tweet.replace('.', '').split(' ');
let date = arr[arr.length -1];
if(regex.test(date)){
  return date;
};
};


//reminder tweet function
let sendStatus = (user, id) => {
  T.post('statuses/update',
    {
      status: `Hello @${user} here is your reminder for today, Goodluck !`,
      in_reply_to_status_id: id
    }, (err, data) => {
      if (err) {
        throw error;
      }
  });
}

//function that gets due reminders
const getDueReminders = ()=>{
  let arr = [];
  let theDate = moment().format('L').split('/');
  let currentDate = `${theDate[1]}/${theDate[0]}/${theDate[2]}`;
  

 db.collection('users').find({date: currentDate}).toArray()
 .then(res => res.forEach(e => {
   sendStatus(e.user, e.tweetID);
   console.log('user reminded !');
}))
.then(()=>{
  db.collection('users').deleteMany({date: currentDate});
  console.log('stale data deleted !');
})
 .catch(err => console.log(err));
}
  
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;
let tb;

const mongoConnect = (cb)=>{
    MongoClient.connect(`mongodb+srv://chani:chidera4life@reminder-clients-vapgd.mongodb.net/test?retryWrites=true&w=majority`,
    {useNewUrlParser: true,
        useUnifiedTopology: true})
    .then(res =>{
        console.log('connected');
        db = res.db();
        //console.log(db);
        tb = true;
        
    })
    .then(()=>{
        if(tb){
          //  console.log('I DON SEE THE DATABSE !');
            return db;
            
        }
       else{throw 'No database found !'};
    })
    .catch(err =>{
        console.log(err);
        tb = false;
    });

    return db;
    
};


db.collection('Entries')
  .insertOne({ _id: 10, item: "box", qty: 20 })
  .then(res => console.log(res))
  .catch(err => console.log(err));





exports.mongoConnect = mongoConnect;
console.log(db)
exports.db = db;
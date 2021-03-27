const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
console.log(process.env.DB_PASS)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9yn9k.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000



// private key
var serviceAccount = require("./configs/burj-al-arab-9e5a4-firebase-adminsdk-5f8xl-9231319371.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingsCollection = client.db("burjAlArab").collection("bookings");
  console.log('connection success');
  
    app.post('/addBooking',(req, res)=>{
        const newBooking = req.body;
        bookingsCollection.insertOne(newBooking)
        .then(result=>{
            res.send(result.insertedCount>0);
        })
        console.log(newBooking);
    })

    app.get('/bookings',(req, res)=>{
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
            console.log({idToken});

            admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;
                console.log(tokenEmail,queryEmail);
                if(tokenEmail === queryEmail){
                     bookingsCollection.find({email:queryEmail})
                    .toArray((err,documents)=>{
                     res.status(200).send(documents);
                    })
                }
            })
            .catch((error) => {
                res.status(401).send('unAuthorized access');
            });
        }
        else{
            res.status(401).send('unAuthorized access');
        }
       
    })

});


app.listen(port);
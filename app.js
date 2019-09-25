require('dotenv').config()
const express =require("express");
const app = express();
const path = require("path");
const initMongo = require('./config/mongo');
const bodyParser = require('body-parser')
const redis = require('redis');
const REDIS_PORT = process.env.REDIS_PORT;




const client = redis.createClient(REDIS_PORT);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.raw())
app.use(bodyParser.json())
app.use(bodyParser.text())
console.log(process.env.NODE_ENV)
app.set('port', process.env.PORT || 3000)









client.on('error', (error) => {
    console.error(error.message);
    })
    client.on('connect',()=>{
    console.info('Successfully connected to redis');
    })

const cors = require('cors');    
app.use(cors({credentials: true, origin: 'http://localhost:4200',exposedHeaders: ["Authorization","Authorizationkey"]}));
// app.use(cors());

app.use('/',require('./Routes'));




// Init MongoDB
initMongo()
app.listen(app.get('port'))


  
require('dotenv').config()
const express =require("express");
const app = express();
const path = require("path");
const initMongo = require('./config/mongo');
const bodyParser = require('body-parser')
const redis = require('redis');
var url = require('url');
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;
// const redisConf = {
//   host: process.env.REDIS_HOST,
//   port: isNaN(process.env.REDIS_PORT) ? 6379 : Number(process.env.REDIS_PORT) ,
//   pass: 'root',
  
//   }

  // var redisclient  = redis.createClient({
  //     host: process.env.SESSION_HOST,
  //     port: sessionport
  // });
// var client = redis.createClient ({
// port : redisPort,
// host : redisHost,
// authPass: redisAuth
// });
var redisURL = url.parse(process.env.REDIS_HOST);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth("root");
// client = redis.createClient(process.env.REDIS_HOST, { auth_pass: 'root' });
console.log(client.options);
// client.auth("root",function(err, response){
// if(err){
// throw err;
// } else {
//   console.log(response)
// }
// });

// client.set("‘foo’","’bar’");
// client.get("‘foo’", function(err, response){
// if(err) {
// throw err;
// }else{
// console.log(response);
// }
// });

// const client = redis.createClient(REDIS_PORT,REDIS_HOST);
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
    });
    client.on('connect',(res)=>{

    console.info('Successfully connected to redis');
    });

    client.on("error", function (err) {
      console.log("Error " + err);
  });

const cors = require('cors');    
app.use(cors({credentials: true, origin: 'http://localhost:4200',exposedHeaders: ["Authorization","Authorizationkey"]}));
// app.use(cors());

app.use('/',require('./Routes'));




// Init MongoDB
initMongo()
app.listen(app.get('port'))


  
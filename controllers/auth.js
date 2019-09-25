const { matchedData } = require('express-validator');
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const auth = require('../middleware/auth')
const utils = require('../middleware/utils')
const UserAccess = require('../models/userAccess')
const redis = require('redis');

const REDIS_PORT = process.env.REDIS_PORT;

const client = redis.createClient(REDIS_PORT);
exports.login = async (req, res) => {
 
    try {
      const data = matchedData(req)
      
      const user = await findUser(data.emailid)
     
      await userIsBlocked(user)
      await checkLoginAttemptsAndBlockExpires(user)
      // const isPassword =   await checkLoginPassword(data.password, user)
      if(user.password==undefined){
        await AssignPassword(data.password, user)
      }
      const isPasswordMatch = await auth.checkPassword(data.password, user)
     
      if (!isPasswordMatch) {
        utils.handleError(res, await passwordsDoNotMatch(user))
      } else {
        // all ok, register access and return token
        user.loginAttempts = 0
        await saveLoginAttemptsToDB(user)
        let result = await saveUserAccessAndReturnToken(req, user)
        let token = []; 
        token.push(result);

        res.json(token);
      }
    } catch (error) {
      utils.handleError(res, error)
    }
  }



  

  exports.roleList =  (req, res, next)=> {

    res.json({
      data:"true",
      message:"",
      status:"success"
   });
    
       
    }

    exports.logout = async (req, res, next)=> {

      let result = await removeUserToken();

      res.json(result);
     
   
       
      }

    exports.addHeader =  (req, res, next)=> {
      res.removeHeader('Authorization');
      res.removeHeader('Authorizationkey');
    
       client.get('token', function(err, result) {
       
          res.set('Authorization', result);
          res.set('Authorizationkey', result);
        
          next();
        // res.writeHead(200,{"Authorization":token});
        // res.writeHead(200,{"Authorizationkey":token });
        
      });
       
       
      }

  const findUser = async email => {
    return new Promise((resolve, reject) => {
    
      User.findOne(
        {
          'emailId':email
        },
        
        (err, item) => {
      
          utils.itemNotFound(err, item, reject, 'USER_DOES_NOT_EXIST')
          resolve(item)
        }
      )
// try{

//   User.findOne( {
//         'emailId':"sachin.kale@timesgroup.com"
//       }).then(res=>{
//     console.log(res);
//     resolve(res)
//   });
// } catch(e){
//   console.error(e)
// }
 })
 }
  const userIsBlocked = async user => {
    // console.log(user,"userIsBlocked");
    return new Promise((resolve, reject) => {
      if (user.blockExpires > new Date()) {
        reject(utils.buildErrObject(409, 'BLOCKED_USER'))
      }
      resolve(true)
    })
  }

  

  const AssignPassword = async (password, user) => {
    return new Promise((resolve, reject) => {
      user.password = password
      user.save((err, item) => {
        console.log(err)
        utils.itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
    })
  }


  const blockIsExpired = user =>
  user.loginAttempts > LOGIN_ATTEMPTS && user.blockExpires <= new Date()

const checkLoginAttemptsAndBlockExpires = async user => {

  return new Promise((resolve, reject) => {
    // console.log(blockIsExpired(user));
    // // Let user try to login again after blockexpires, resets user loginAttempts
    // if (blockIsExpired(user)) {
    //   user.loginAttempts = 0
    //   user.save((err, result) => {
    //     if (err) {
    //       reject(utils.buildErrObject(422, err.message))
    //     }
    //     if (result) {
    //       resolve(true)
    //     }
    //   })
    // } else {
    //   // User is not blocked, check password (normal behaviour)
    //   resolve(true)
    // }
    resolve(true)
  })
 
}





const checkLoginPassword = async (password,user) => {

  return new Promise((resolve, reject) => {
    User.findOne(
      {
        password
      },
      (err, item) => {
        if(err){
          console.log(err);
          reject(false);
        }
    if(item){
      resolve(true);
    }
    else{
      resolve(false);

    }
        
  }
    )
  })}
  
    // console.log(blockIsExpired(user));
    // // Let user try to login again after blockexpires, resets user loginAttempts
    // if (blockIsExpired(user)) {
    //   user.loginAttempts = 0
    //   user.save((err, result) => {
    //     if (err) {
    //       reject(utils.buildErrObject(422, err.message))
    //     }
    //     if (result) {
    //       resolve(true)
    //     }
    //   })
    // } else {
    //   // User is not blocked, check password (normal behaviour)
    //   resolve(true)
    // }


const passwordsDoNotMatch = async user => {
    user.loginAttempts += 1
    await saveLoginAttemptsToDB(user)
    return new Promise((resolve, reject) => {
      if (user.loginAttempts <= LOGIN_ATTEMPTS) {
        resolve(utils.buildErrObject(409, 'WRONG_PASSWORD'))
      } else {
        resolve(blockUser(user))
      }
      reject(utils.buildErrObject(422, 'ERROR'))
    })
  }

  const saveLoginAttemptsToDB = async user => {
    return new Promise((resolve, reject) => {
      user.save((err, result) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        if (result) {
          resolve(true)
        }
      })
    })
  }

  const generateToken = user => {
    // Gets expiration time
    const expiration =
      Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES
     
    // returns signed and encrypted token
    let token=auth.encrypt(
      jwt.sign(
        {
          data: {
            _id: user
          },
          exp: expiration
        },
        process.env.JWT_SECRET
      )
    )
    client.set('token', token);
    return token
      }

  const setUserInfo = req => {
    let user = {
      _id: req._id,
      name: req.name,
      email: req.email,
      role: req.role,
      verified: req.verified
    }
    // Adds verification for testing purposes
    if (process.env.NODE_ENV !== 'production') {
      user = {
        ...user,
        verification: req.verification
      }
    }
    return user
  }

  const saveUserAccessAndReturnToken = async (req, user) => {
    return new Promise((resolve, reject) => {
      const userAccess = new UserAccess({
        email: user.emailId,
        ip: utils.getIP(req),
        browser: utils.getBrowserInfo(req),
        country: utils.getCountry(req)
      })
      userAccess.save(err => {
        if (err) {
          reject()
           reject(utils.buildErrObject(500, err.message))
        }
        // const userInfo = setUserInfo(user)
        // Returns data with access token
        resolve({
          message: '',
          data1: '',
          token: generateToken(user._id),
          status: 'success',
          data: user
        })
      })
    })
  }
  const removeUserToken = async () => {
    return new Promise((resolve, reject) => {
    client.del('token', function(err, response) {
      if (response == 1) {
        resolve({
          data:"true",
          message:"Logout successful",
          status:"success"
       });
      } else{

        reject(utils.buildErrObject(500, "Logout Failed"))
      //   res.json({
      //     data:"false",
      //     message:"Logout Failed",
      //     status:"Fail"
      //  });
      }
   })
  
  })
}
    
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const UserSchema = new mongoose.Schema(
  {
    activityCode : {
      type: String,
      required: true
    },
    activityName : {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true
     
    },
    
    birthdate : {
      type: String
    
    },
    branchCode : {
      type: String,
      required: true
    },
    branchName : {
      type: String,
      required: true
    },
    companyCode: {
      type: String
    },
    companyName: {
      type: String
    },
    deptGroup: {
      type: String
    },
    deptGroupName: {
      type: String
    },
  
    designation: {
      type: String
    },
    emailId: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: 'EMAIL_IS_NOT_VALID'
      },
      lowercase: true,
      unique: true,
      required: true
      
    },
    empFullName: {
      type: String
    },
    firstName: {
      type: String
    },
    fullName: {
      type: String
    },
    gender: {
      type: String
    },
    joiningdate: {
      type: String
    },
    locationCode: {
      type: String
    },
    locationName: {
      type: String
    },
    panNumber: {
      type: String
    },
    payId: {
      type: String
    },
    payrollType: {
      type: String
    },
    pfNumber: {
      type: String
    },
    portalId: {
      type: String
    },
    sapNumber: {
      type: String
    },
    signOnStatus: {
      type: String
    },
    surname: {
      type: String
    },
    timescapeUserOID: {
      type: String
    },
    title: {
      type: String
    },
    userType: {
      type: String,
      enum: ['EMP', 'MANAGER'],
      default: 'EMP'
    },
   
    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    blockExpires: {
      type: Date,
      default: Date.now,
      select: false
    }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'user'
  }
)

const hash = (user, salt, next) => {
  bcrypt.hash(user.password, salt, null, (error, newHash) => {
    if (error) {
      return next(error)
    }
    user.password = newHash
    return next()
  })
}

const genSalt = (user, SALT_FACTOR, next) => {
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err)
    }
    return hash(user, salt, next)
  })
}

UserSchema.pre('save', function(next) {
 
  const that = this
  const SALT_FACTOR = 5
  if (!that.isModified('password')) {
    return next()
  }
  return genSalt(that, SALT_FACTOR, next)
})

UserSchema.methods.comparePassword = function(passwordAttempt, cb) {

  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  )
}
UserSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('user', UserSchema)

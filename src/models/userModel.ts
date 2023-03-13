/* eslint-disable @typescript-eslint/consistent-type-definitions */
import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

interface userSchemaTypes {
  name: string;
  email: string;
  photo: string;
  role: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: number;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changesPasswordAfter(decodedTime: string): boolean;
  createPasswordResetToken(): string;
  active: boolean;
  verifyEmailToken(): string;
  verifyToken: string | undefined;
  verified: boolean;
}

const userSchema = new mongoose.Schema<userSchemaTypes>({
  name: { type: String, required: [true, 'Please tell us your name'] },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //Custom validator returns true or false
    //This is only works on CREATE and SAVE.When we need to update an user need to use SAVE instead of findOneAndUpdate

    validate: {
      validator: function (this: userSchemaTypes, el: any) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  verifyToken: String,
  verified: {
    type: Boolean,
    default: false,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //If user updates only the email we don't need to encrypt the password again.this refers to the current document (current user)
  //isModified is a document method to check if the password filed is modified
  //Only run if password was actually modified
  if (!this.isModified('password')) return next();
  //Hash the password with salt of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete passwordConfirm field
  // Change passwordConfirm to undefined. It is used to validate password matches.We put passwordConfirm as required but that is only for input checking.
  // Not required for saving to database.
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  //To check whether document is new or password changed
  if (!this.isModified('password') || this.isNew) return next();
  //Sometimes token is created before saving the passwordChangedAt time
  //So we reduce the password changed time by 1 second
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Using query middleware
//Regular expression to find queries starting with find
userSchema.pre(/^find/, function (next) {
  //This points to current query
  //Find documents set to active:true does not work because we  have set select:false for active property
  //Therefore we need to use active:{ne:false}
  this.find({ active: { $ne: false } });
  next();
});

//Instance method -Method available on all the documents in a certain collection
//In instance methods since they are available on the document this keyword points to current document
//Because in the userSchema password was set to select:false unable to use this.password
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function (JWTTimeStamp: number) {
  if (this.passwordChangedAt) {
    //Converting to passwordChangedAt to seconds because JWTTimeStamp is in seconds
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    // console.log(changedTimestamp, JWTTimeStamp);
    //Below line returns true if password changed and false if password not changed
    return JWTTimeStamp < changedTimestamp;
  }
  //False means password not changed -No passwordChangedAt property
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //We should never store resetTokens in the database
  //So we encrypt is using built in crypto module
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //To set password reset to 10 minutes after creation

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log(
    { resetToken },
    this.passwordResetToken,
    this.passwordResetExpires.toLocaleTimeString('en-US')
  );
  //Returning plain text token
  //We are sending the unencrypted version
  //We are saving the encrypted password in the database
  return resetToken;
};

userSchema.methods.verifyEmailToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.verifyToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');

  return verifyToken;
};

const User = mongoose.model<userSchemaTypes>('User', userSchema);
export default User;

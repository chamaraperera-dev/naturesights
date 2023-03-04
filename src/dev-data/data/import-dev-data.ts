import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tour from '../../models/tourModel';
import Review from '../../models/reviewModel';
import User from '../../models/userModel';

dotenv.config({ path: './config.env' });

let DB = '';
if (process.env.DATABASE && process.env.DATABASE_PASSWORD) {
  DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
}
mongoose.set('strictQuery', true);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

//READ JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf8')
);
//Import DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully imported into DB');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete all DATA from DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted from DB');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);

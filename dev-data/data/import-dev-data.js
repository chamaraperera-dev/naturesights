const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', true);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

//READ JSON file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);

//Import DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
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

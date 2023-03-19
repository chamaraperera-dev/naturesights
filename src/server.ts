import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', (err: any) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './.env' });
import app from './app';

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

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`App running on ${port}...`));

//Process object will emit an object called unhandled rejection. We can subscribe to that with process.on
process.on('unhandledRejection', (err: any) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  //To shut down the app use process exit.code 0 success 1 uncaught exception
  //process.exit will abruptly shutdown the server. So first we shutdown the server and run the process.exit in callback function
  //Gives time to server to handle the requests
  server.close(() => process.exit(1));
});

//Preventing server shutting down abruptly with SIGTERM signal allowing pending requesting to process
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => console.log('Process terminated'));
});

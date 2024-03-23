const mongoose = require('mongoose');
const dotenv = require('dotenv');

//handling uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception 🥺. Shutting Application...');
  console.log(err);
  console.log(err.name, err.message);

  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  //.connect(process.env.DATABASE_URL_LOCAL)
  .then((con) => {
    //console.log(con.connections);
    console.log('DB connection successful!');
  });

//console.log(app.get('env'));

console.log(process.env);

// const testTour = new Tour({
//   name: 'The Forest Hicker',
//   price: 997,
// rating: 4.9,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR:', err);
//   });

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//handling unhandled rejections imp: use it as the safty nut at last and handle errors where they occurs
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection 🥺. Shutting Application...');
  console.log(err.name, err.message);

  //gracefully closing the server so that pending requests and currently executing tasks should be completed first before server shudowns

  server.close(() => {
    process.exit(1);
  });
});

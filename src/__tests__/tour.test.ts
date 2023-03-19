import supertest from 'supertest';
import app from '../app';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: `${__dirname}/../../.env` });

let DB = '';
if (process.env.DATABASE && process.env.DATABASE_PASSWORD) {
  DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
}

/* Connecting to the database before each test. */
mongoose.set('strictQuery', true);

beforeEach(async () => {
  await mongoose.connect(DB);
});

afterEach(async () => {
  await mongoose.connection.close();
});

describe('tours', () => {
  describe('get tours', () => {
    describe('given the tours does exist', () => {
      it('should return a 200', async () => {
        const res = await supertest(app).get('/api/v1/tours');
        expect(res.status).toBe(200);
      });
    });
  });
});

describe('tour', () => {
  describe('get tour', () => {
    describe('given the tour does exist', () => {
      it('should return a 200', async () => {
        const tourId = '5c88fa8cf4afda39709c296c';
        const res = await supertest(app).get(`/api/v1/tours/${tourId}`);
        expect(res.status).toBe(200);
      });
    });
  });
});

// describe('tour', () => {
//   describe('get tour', () => {
//     describe('given the tour does not exist', () => {
//       it('should return a 404', async () => {
//         const tourId = '1';
//         const res = await supertest(app).get(`/api/v1/tours/${tourId}`);
//         expect(res.status).toBe(404);
//       });
//     });
//   });
// });

// describe('tour', () => {
//   describe('get tour', () => {
//     describe('given the tour does not exist', () => {
//       it('should return a 404', async () => {
//         const tourId = '5c88fa8cf4afda39709c296d';
//         const res = await supertest(app).get(`/api/v1/tours/${tourId}`);
//         expect(res.status).toBe(404);
//       });
//     });
//   });
// });

// describe('tour', () => {
//   describe('get tour', () => {
//     describe('given the tour does not exist', () => {
//       it('should return a 404', async () => {
//         const tourId = '5c88fa8cf4afda39709c0000';
//         const res = await supertest(app).get(`/api/v1/tours/${tourId}`);
//         expect(res.status).toBe(404);
//       });
//     });
//   });
// });

/* describe('tours', () => {
  describe('create tour', () => {
    describe('given the tour created', () => {
      it('should create and product and return a 201', async () => {
        const res = await supertest(app).post('/api/v1/tours').send({
          name: 'Test tour Three',
          duration: 1,
          maxGroupSize: 1,
          difficulty: 'easy',
          price: 200,
          priceDiscount: 100,
          summary: 'Test tour',
          imageCover: 'tour-3-cover.jpg',
          ratingsAverage: 1,
          secretTour: false,
        });

        expect(res.status).toBe(201);
        expect(res.body.data.tour.name).toBe('Test tour Three');
      });
    });
  });
}); */

/* describe('tours', () => {
  describe('modify tours', () => {
    describe('given the tours updated', () => {
      it('should return a 200', async () => {
        const tourId = '63d45fb17150102eb901cad7';
        const res = await supertest(app).patch(`/api/v1/tours/${tourId}`).send({
          name: 'Test tour Four',
          duration: 2,
          maxGroupSize: 2,
          difficulty: 'easy',
        });
        expect(res.status).toBe(200);
        expect(res.body.data.tour.duration).toBe(2);
      });
    });
  });
}); */

// describe('tours', () => {
//   describe('delete tours', () => {
//     describe('given the tours deleted', () => {
//       it('should return a 204', async () => {
//         const tourId = '63d45fb17150102eb901cad7';
//         const res = await supertest(app).delete(`/api/v1/tours/${tourId}`);
//         expect(res.status).toBe(204);
//       });
//     });
//   });
// });

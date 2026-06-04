const request = require('supertest');
const app = require('../app');
const { closeDb } = require('../db');

afterAll(() => closeDb());

describe('Vehicles API', () => {
  let vehicleId;

  test('GET /api/vehicles returns empty array initially', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/vehicles creates a vehicle', async () => {
    const res = await request(app).post('/api/vehicles').send({
      make: 'Toyota', model: 'Camry', year: 2020, mileage: 50000, condition: 'good'
    });
    expect(res.status).toBe(201);
    expect(res.body.make).toBe('Toyota');
    expect(res.body.model).toBe('Camry');
    expect(res.body.year).toBe(2020);
    expect(res.body.id).toBeDefined();
    vehicleId = res.body.id;
  });

  test('POST /api/vehicles returns 400 without required fields', async () => {
    const res = await request(app).post('/api/vehicles').send({ make: 'Ford' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/vehicles returns 409 on duplicate VIN', async () => {
    await request(app).post('/api/vehicles').send({ make: 'A', model: 'B', year: 2020, vin: 'DUPVIN123' });
    const res = await request(app).post('/api/vehicles').send({ make: 'C', model: 'D', year: 2021, vin: 'DUPVIN123' });
    expect(res.status).toBe(409);
  });

  test('GET /api/vehicles/:id returns vehicle', async () => {
    const res = await request(app).get(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(vehicleId);
  });

  test('GET /api/vehicles/:id returns 404 for missing vehicle', async () => {
    const res = await request(app).get('/api/vehicles/99999');
    expect(res.status).toBe(404);
  });

  test('PUT /api/vehicles/:id updates vehicle', async () => {
    const res = await request(app).put(`/api/vehicles/${vehicleId}`).send({ mileage: 60000 });
    expect(res.status).toBe(200);
    expect(res.body.mileage).toBe(60000);
    expect(res.body.make).toBe('Toyota');
  });

  test('PUT /api/vehicles/:id returns 404 for missing vehicle', async () => {
    const res = await request(app).put('/api/vehicles/99999').send({ mileage: 1000 });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/vehicles/:id deletes vehicle', async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(204);
    const check = await request(app).get(`/api/vehicles/${vehicleId}`);
    expect(check.status).toBe(404);
  });

  test('DELETE /api/vehicles/:id returns 404 for missing vehicle', async () => {
    const res = await request(app).delete('/api/vehicles/99999');
    expect(res.status).toBe(404);
  });
});

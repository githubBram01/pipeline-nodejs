const request = require('supertest');
const app = require('../app');
const { closeDb } = require('../db');

afterAll(() => closeDb());

describe('Evaluations API', () => {
  let vehicleId;
  let evalId;

  beforeAll(async () => {
    const res = await request(app).post('/api/vehicles').send({
      make: 'Honda', model: 'Civic', year: 2019, condition: 'good'
    });
    vehicleId = res.body.id;
  });

  test('POST creates evaluation', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/evaluations`)
      .send({ evaluator_name: 'Alice', score: 8, notes: 'Great condition' });
    expect(res.status).toBe(201);
    expect(res.body.score).toBe(8);
    expect(res.body.evaluator_name).toBe('Alice');
    expect(res.body.status).toBe('pending');
    evalId = res.body.id;
  });

  test('POST returns 400 without evaluator_name', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/evaluations`)
      .send({ score: 7 });
    expect(res.status).toBe(400);
  });

  test('POST returns 400 without score', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/evaluations`)
      .send({ evaluator_name: 'Bob' });
    expect(res.status).toBe(400);
  });

  test('POST returns 400 for score > 10', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/evaluations`)
      .send({ evaluator_name: 'Bob', score: 11 });
    expect(res.status).toBe(400);
  });

  test('POST returns 400 for score < 1', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/evaluations`)
      .send({ evaluator_name: 'Bob', score: 0 });
    expect(res.status).toBe(400);
  });

  test('POST returns 404 for unknown vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/99999/evaluations')
      .send({ evaluator_name: 'Bob', score: 7 });
    expect(res.status).toBe(404);
  });

  test('GET returns evaluations for vehicle', async () => {
    const res = await request(app).get(`/api/vehicles/${vehicleId}/evaluations`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].evaluator_name).toBe('Alice');
  });

  test('GET /api/evaluations lists all evaluations', async () => {
    const res = await request(app).get('/api/evaluations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('PUT updates evaluation status', async () => {
    const res = await request(app)
      .put(`/api/evaluations/${evalId}`)
      .send({ status: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  test('PUT returns 400 for invalid status', async () => {
    const res = await request(app)
      .put(`/api/evaluations/${evalId}`)
      .send({ status: 'invalid' });
    expect(res.status).toBe(400);
  });

  test('PUT returns 404 for unknown evaluation', async () => {
    const res = await request(app).put('/api/evaluations/99999').send({ status: 'approved' });
    expect(res.status).toBe(404);
  });

  test('DELETE removes evaluation', async () => {
    const res = await request(app).delete(`/api/evaluations/${evalId}`);
    expect(res.status).toBe(204);
  });

  test('DELETE returns 404 for unknown evaluation', async () => {
    const res = await request(app).delete('/api/evaluations/99999');
    expect(res.status).toBe(404);
  });
});

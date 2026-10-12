import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('1. Health Check Endpoint - GET /api/health returns HTTP 200 or 503 with service status', async () => {
  const res = await request(app).get('/api/health');
  assert.ok([200, 503].includes(res.statusCode), `Status code ${res.statusCode} should be 200 or 503`);
  assert.ok(res.body.status, 'Response should contain a status field');
  assert.ok(res.body.services, 'Response should include services status');
  assert.equal(res.body.services.api, 'healthy');
});

test('2. Unauthenticated Protected Route - GET /api/cart returns HTTP 401 Unauthorized', async () => {
  const res = await request(app).get('/api/cart');
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Authentication required/i);
});

test('3. Unauthenticated Protected Route - GET /api/orders returns HTTP 401 Unauthorized', async () => {
  const res = await request(app).get('/api/orders');
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
});

test('4. Unauthenticated Admin Route - GET /api/admin/stats returns HTTP 401', async () => {
  const res = await request(app).get('/api/admin/stats');
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
});

test('5. Non-existent API route returns clean 404 JSON', async () => {
  const res = await request(app).get('/api/unknown-non-existent-route-xyz');
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not found/i);
});

test('6. Input Validation - Register without required fields returns 400 Bad Request', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'incomplete@example.com' });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /required/i);
});

test('7. Input Validation - Register with password mismatch returns 400 Bad Request', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword'
    });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /do not match/i);
});

test('8. Input Validation - Login without credentials returns 400 Bad Request', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /required/i);
});

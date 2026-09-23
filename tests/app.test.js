const request = require('supertest');
const app = require('../src/app');

describe('Task API', () => {

    test('GET / should return API message', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Task API is running');
    });

    test('GET /health should return healthy', async () => {
        const response = await request(app).get('/health');

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('healthy');
    });

    test('GET /api/tasks should return tasks', async () => {
        const response = await request(app).get('/api/tasks');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('POST /api/tasks should create a task', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .send({
                title: 'Test Jenkins Pipeline'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Test Jenkins Pipeline');
        expect(response.body.completed).toBe(false);
    });

    test('GET /metrics should expose Prometheus metrics', async () => {
        const response = await request(app).get('/metrics');

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain(
            'task_api_http_requests_total'
        );
    });

});

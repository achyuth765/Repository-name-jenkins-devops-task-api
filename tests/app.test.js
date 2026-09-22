const request = require("supertest");
const app = require("../src/app");

describe("Task API", () => {

    test("GET /health should return healthy", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("healthy");
    });

    test("GET /api/tasks should return tasks", async () => {
        const response = await request(app).get("/api/tasks");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});
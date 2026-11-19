const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

// Set NODE_ENV to test to avoid port collision
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

const app = require('../app');

describe('GiftLink API Automated Integration Test Suite', () => {
    let donorToken = '';
    let requesterToken = '';
    const donorEmail = `donor_${Date.now()}@example.com`;
    const requesterEmail = `requester_${Date.now()}@example.com`;
    let createdGiftId = '';
    let requestId = '';

    // 1. Health & Security
    describe('1. Health Check & Security Headers', () => {
        it('GET /api/health should return status UP', async () => {
            const res = await request(app).get('/api/health');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.status, 'UP');
        });

        it('Should include Helmet security headers', async () => {
            const res = await request(app).get('/api/health');
            assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
        });
    });

    // 2. Authentication & Authorization
    describe('2. Authentication & Authorization Flow', () => {
        it('POST /api/auth/register should create donor account', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Alice',
                    lastName: 'Donor',
                    email: donorEmail,
                    password: 'SecurePassword123!'
                });

            assert.strictEqual(res.status, 201);
            assert.ok(res.body.authtoken);
            assert.strictEqual(res.body.email, donorEmail);
            donorToken = res.body.authtoken;
        });

        it('POST /api/auth/register should create requester account', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Bob',
                    lastName: 'Requester',
                    email: requesterEmail,
                    password: 'SecurePassword123!'
                });

            assert.strictEqual(res.status, 201);
            assert.ok(res.body.authtoken);
            requesterToken = res.body.authtoken;
        });

        it('POST /api/auth/register should reject duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Duplicate',
                    lastName: 'User',
                    email: donorEmail,
                    password: 'AnotherPassword123'
                });

            assert.strictEqual(res.status, 400);
            assert.ok(res.body.error);
        });

        it('POST /api/auth/login should authenticate valid user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: donorEmail,
                    password: 'SecurePassword123!'
                });

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.authtoken);
            assert.strictEqual(res.body.email, donorEmail);
            assert.ok(res.body.userName.includes('Alice'));
            donorToken = res.body.authtoken;
        });

        it('POST /api/auth/login should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: donorEmail,
                    password: 'WrongPassword999'
                });

            assert.strictEqual(res.status, 401);
        });

        it('PUT /api/auth/update should block unauthenticated requests (IDOR fix)', async () => {
            const res = await request(app)
                .put('/api/auth/update')
                .send({
                    firstName: 'Hacked Name'
                });

            assert.strictEqual(res.status, 401);
        });

        it('PUT /api/auth/update should update profile with valid JWT', async () => {
            const res = await request(app)
                .put('/api/auth/update')
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    firstName: 'Alice Updated',
                    address: '123 Verified Street'
                });

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.user);
            assert.strictEqual(res.body.user.firstName, 'Alice Updated');
        });
    });

    // 3. Gifts Catalog, CRUD & Donor Ownership
    describe('3. Gifts Catalog, CRUD & Donor Ownership', () => {
        it('GET /api/gifts should return all gifts array or paginated object', async () => {
            const res = await request(app).get('/api/gifts');
            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body) || Array.isArray(res.body.gifts));
        });

        it('GET /api/gifts?page=1&limit=2 should return pagination metadata', async () => {
            const res = await request(app).get('/api/gifts?page=1&limit=2');
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.pagination);
            assert.strictEqual(res.body.pagination.page, 1);
            assert.strictEqual(res.body.pagination.limit, 2);
            assert.ok(Array.isArray(res.body.gifts));
        });

        it('POST /api/gifts should require name and category', async () => {
            const res = await request(app)
                .post('/api/gifts')
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    condition: 'Good'
                });

            assert.strictEqual(res.status, 400);
        });

        it('POST /api/gifts should create a gift listing when authenticated', async () => {
            const res = await request(app)
                .post('/api/gifts')
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    name: 'Solid Wood Desk',
                    category: 'Living',
                    condition: 'Like New',
                    zipcode: '90210',
                    age_years: 1,
                    description: 'A study desk in pristine condition created during automated integration tests.'
                });

            assert.strictEqual(res.status, 201);
            assert.ok(res.body.gift);
            assert.ok(res.body.gift.id);
            assert.strictEqual(res.body.gift.name, 'Solid Wood Desk');
            assert.strictEqual(res.body.gift.donorEmail, donorEmail.toLowerCase());
            createdGiftId = res.body.gift.id;
        });

        it('GET /api/gifts/my-gifts should return gifts listed by the donor', async () => {
            const res = await request(app)
                .get('/api/gifts/my-gifts')
                .set('Authorization', `Bearer ${donorToken}`);

            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body));
            const found = res.body.find(g => g.id === createdGiftId);
            assert.ok(found, 'Created gift should be present in donor listings');
        });

        it('GET /api/gifts/:id should fetch gift details by id', async () => {
            const res = await request(app).get(`/api/gifts/${createdGiftId}`);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.name, 'Solid Wood Desk');
        });

        it('PUT /api/gifts/:id should allow donor to edit their listing', async () => {
            const res = await request(app)
                .put(`/api/gifts/${createdGiftId}`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    name: 'Updated Solid Wood Desk',
                    condition: 'Good'
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.gift.name, 'Updated Solid Wood Desk');
        });

        it('PUT /api/gifts/:id should reject edits from non-owner users', async () => {
            const res = await request(app)
                .put(`/api/gifts/${createdGiftId}`)
                .set('Authorization', `Bearer ${requesterToken}`)
                .send({
                    name: 'Hacked Title Attempt'
                });

            assert.strictEqual(res.status, 403);
        });
    });

    // 4. Search & ReDoS Security
    describe('4. Search Engine & ReDoS Protection', () => {
        it('GET /api/search with query term should return matching results', async () => {
            const res = await request(app).get('/api/search?name=Desk');
            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body));
        });

        it('GET /api/search with complex regex characters should safely escape without ReDoS', async () => {
            const res = await request(app).get('/api/search?name=(([a-z]+)+)%24');
            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body));
        });
    });

    // 5. Gift Claim Request Flow
    describe('5. Gift Claim & Request Workflow', () => {
        it('POST /api/requests should reject donor requesting their own listing', async () => {
            const res = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    giftId: createdGiftId,
                    requesterName: 'Alice Self',
                    requesterContact: donorEmail,
                    message: 'Self request attempt'
                });

            assert.strictEqual(res.status, 400);
        });

        it('POST /api/requests should allow beneficiary requesting available gift', async () => {
            const res = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${requesterToken}`)
                .send({
                    giftId: createdGiftId,
                    requesterName: 'Bob Requester',
                    requesterContact: requesterEmail,
                    message: 'I would love to pick this up this weekend!'
                });

            assert.strictEqual(res.status, 201);
            assert.ok(res.body.request.id);
            assert.strictEqual(res.body.request.status, 'Pending');
            requestId = res.body.request.id;
        });

        it('GET /api/requests/received should list the request for donor', async () => {
            const res = await request(app)
                .get('/api/requests/received')
                .set('Authorization', `Bearer ${donorToken}`);

            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body));
            const found = res.body.find(r => r.id === requestId);
            assert.ok(found, 'Request should be found in donor received list');
        });

        it('GET /api/requests/sent should list the request for requester', async () => {
            const res = await request(app)
                .get('/api/requests/sent')
                .set('Authorization', `Bearer ${requesterToken}`);

            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body));
            const found = res.body.find(r => r.id === requestId);
            assert.ok(found, 'Request should be found in sent list');
        });

        it('PUT /api/requests/:id/status should allow donor to accept the request', async () => {
            const res = await request(app)
                .put(`/api/requests/${requestId}/status`)
                .set('Authorization', `Bearer ${donorToken}`)
                .send({
                    status: 'Accepted'
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.request.status, 'Accepted');
        });

        it('DELETE /api/gifts/:id should allow donor to delete their gift', async () => {
            const res = await request(app)
                .delete(`/api/gifts/${createdGiftId}`)
                .set('Authorization', `Bearer ${donorToken}`);

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.message.includes('deleted'));
        });
    });
});

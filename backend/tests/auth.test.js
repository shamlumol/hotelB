const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Force the test database URI
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/hotelB_test';

beforeAll(async () => {
  // Disconnect from any default connections first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  // Connect to the test database
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  // Clean up database and close connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  // Clear users collection before each test
  await User.deleteMany();
});

describe('🔑 Authentication API Tests (/api/auth)', () => {
  
  describe('POST /register', () => {
    it('should register a new user successfully with a welcome loyalty bonus of 1200 points', async () => {
      const userData = {
        name: 'Test Tester',
        email: 'tester@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.loyaltyPoints).toBe(1200); // 1200 welcome points
      expect(response.body.user.loyaltyTier).toBe('None'); // Starts at None tier
    });

    it('should not register a user with an already registered email', async () => {
      // Pre-create user (password will be hashed automatically by pre-save hook)
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        loyaltyPoints: 1200,
        loyaltyTier: 'None'
      });

      const duplicateUserData = {
        name: 'Another Name',
        email: 'existing@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUserData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User already exists');
    });

    it('should fail registration if required fields are missing', async () => {
      const incompleteData = {
        name: 'Missing Email Only'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      // Mongoose schema validation returns 500 error catch in Express handler
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create user (password will be hashed automatically by pre-save hook)
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'secretpassword',
        loyaltyPoints: 1200,
        loyaltyTier: 'None'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'secretpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(credentials.email);
    });

    it('should reject login with incorrect password', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login for non-existent email', async () => {
      const credentials = {
        email: 'notfound@example.com',
        password: 'secretpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create user (password will be hashed automatically by pre-save hook)
      const user = await User.create({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'mypassword',
        loyaltyPoints: 1200,
        loyaltyTier: 'None'
      });

      userId = user._id.toString();

      // Log in to retrieve token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'mypassword'
        });

      token = loginResponse.body.token;
    });

    it('should fetch the profile of the logged-in user successfully when authorized', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(userId);
      expect(response.body.user.email).toBe('profile@example.com');
    });

    it('should reject profile fetching with an invalid authorization token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtokenstring');

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject profile fetching when no authorization header is supplied', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

});

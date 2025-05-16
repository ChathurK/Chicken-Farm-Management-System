# Chicken Farm Management System - Testing Documentation

## Overview
This document provides instructions for testing the Chicken Farm Management System application, both for the backend API and frontend React application.

## Setup

### Backend Testing (Node.js/Express)
The backend uses Jest and Supertest for testing API endpoints and models.

#### Running Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
```

#### Test Environment
- Tests use a separate database defined in `.env.test`
- The test database is recreated from scratch for each test run
- Middleware like authentication is mocked for testing

### Frontend Testing (React)
The frontend uses Vitest, React Testing Library and MSW (Mock Service Worker) for testing components and API integrations.

#### Running Frontend Tests
```bash
cd frontend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests and generate coverage report
```

## Test Types

### Backend Tests

1. **Unit Tests**
   - Located in `backend/src/__tests__/models/`
   - Test individual models and business logic

2. **API Tests**
   - Located in `backend/src/__tests__/routes/`
   - Test API endpoints for proper responses

3. **Integration Tests**
   - Located in `backend/src/__tests__/integration/`
   - Test several components working together

### Frontend Tests

1. **Component Tests**
   - Located in `frontend/src/__tests__/components/`
   - Test individual React components

2. **API Mocking Tests**
   - Use Mock Service Worker to intercept and mock API calls
   - Test components that rely on API data

3. **Route Tests**
   - Test routing and protected routes functionality

## Writing New Tests

### Backend Test Conventions
- Name test files with `.test.js` extension
- Place tests in the corresponding directory in `__tests__` folder
- Use descriptive test cases that explain what's being tested

### Frontend Test Conventions
- Name test files with `.test.jsx` extension
- Use React Testing Library queries in order of preference:
  1. Accessible queries (`getByRole`, `getByLabelText`)
  2. Text-based queries (`getByText`)
  3. Test ID queries (`getByTestId`) as last resort
- Mock external dependencies properly

## Troubleshooting Common Test Issues

### Backend Tests
- Make sure the test database is configured properly
- Ensure your `.env.test` file has correct variables
- If authentication fails, check the auth middleware mock

### Frontend Tests
- If you get "act" warnings, use `waitFor` to wait for async operations
- For router issues, ensure you're wrapping components in a router provider
- For context issues, wrap components in the necessary context providers

## Adding Test Coverage

When adding new features, aim to create tests that cover:
1. Happy path (expected usage)
2. Edge cases
3. Error handling

## Examples

See the existing test files for examples of how to structure and write tests for this project.

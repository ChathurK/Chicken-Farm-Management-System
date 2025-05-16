# Visual Testing Guide for Your Project

## What We're Testing

```
┌─────────────────────────────────────────┐
│           CHICKEN FARM SYSTEM           │
├───────────────┬─────────────────────────┤
│  FRONTEND     │         BACKEND         │
│  (React)      │       (Express)         │
├───────────────┼─────────────────────────┤
│ Components    │ API Endpoints           │
│ Pages         │ Business Logic          │
│ State         │ Database Operations     │
└───────────────┴─────────────────────────┘
```

## Types of Tests

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│      UNIT TESTS         │  │   INTEGRATION TESTS     │  │     E2E TESTS           │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ Test individual         │  │ Test how components     │  │ Test entire workflows   │
│ functions/components    │  │ work together           │  │ from user's perspective │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ Example:                │  │ Example:                │  │ Example:                │
│ - Button click          │  │ - Form with validation  │  │ - Login to checkout     │
│ - Validation function   │  │ - API call with auth    │  │ - Add chicken to order  │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

## What To Test First (Priority)

```
HIGH PRIORITY  │  MEDIUM PRIORITY  │  LOWER PRIORITY
───────────────┼──────────────────┼─────────────────
Authentication │ Data filtering   │ Visual styling
Chicken data   │ Sorting          │ Animations  
Egg tracking   │ Search           │ Minor features
Order process  │ Reporting        │ Edge cases
```

## Testing Workflow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  WRITE   │     │   RUN    │     │   FIX    │     │  COMMIT  │
│  TEST    │ ──> │  TESTS   │ ──> │  BUGS    │ ──> │  CODE    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ^                                                  │
     └──────────────────────────────────────────────────┘
```

## Example Test Code Structure

```javascript
// 1. ARRANGE (set up the test)
const mockChickens = [{ id: 1, breed: 'Leghorn' }];
db.execute.mockResolvedValue([mockChickens]);

// 2. ACT (perform the action being tested)
const response = await request(app).get('/api/chickens');

// 3. ASSERT (verify the result is what you expect)
expect(response.statusCode).toBe(200);
expect(response.body).toEqual(mockChickens);
```

## Tools We're Using

```
FRONTEND                      BACKEND
───────────────────────       ───────────────────────
Vitest                        Jest
React Testing Library         Supertest
MSW (Mock Service Worker)     Mock functions
```

## Common Test Commands

```
# Run backend tests
cd backend
npm test
npx jest src/__tests__/simple-examples/chicken-api.test.js

# Run frontend tests
cd frontend
npm test
npx vitest run src/__tests__/simple-examples/pagination-simple.test.jsx
```

## Test File Naming Convention

```
src/
├── components/
│   └── ChickenList.jsx
├── __tests__/
│   └── components/
│       └── ChickenList.test.jsx  # <-- Test file for ChickenList
```

Remember: Start small, test critical features first, and gradually build up your test suite!

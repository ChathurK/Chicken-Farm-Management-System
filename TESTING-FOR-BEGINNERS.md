# Testing Guide for Beginners

This guide is designed to help undergraduate students get started with testing in their chicken farm management project, especially if you have no prior testing experience.

## Why Testing Is Important for Your Project

1. **Client Satisfaction**: Your client will be impressed when you can show them how thoroughly you've tested your application.

2. **Graduation Requirements**: Many universities require proper testing for capstone and final-year projects.

3. **Reduce Manual Work**: Instead of clicking through your application to check every feature after changes, you can run automated tests.

4. **Catch Bugs Earlier**: If something breaks during development, tests will tell you immediately.

## Step-by-Step Testing Plan

### Step 1: Start with the Backend API

Backend tests are easier to understand because they have clear inputs and outputs.

#### Example: Testing the Chickens API

```javascript
// A simple test for your chicken API endpoint
it('should return all chickens', async () => {
  // Make a request to your API
  const response = await request(app).get('/api/chickens');
  
  // Check if the response status is 200 (success)
  expect(response.statusCode).toBe(200);
  
  // Check if the response contains an array of chickens
  expect(Array.isArray(response.body)).toBe(true);
});
```

**How to run this test:**
```bash
cd backend
npm test
```

### Step 2: Test a Simple Frontend Component

Pick a small component to test first, like a button or a form input.

#### Example: Testing the Pagination Component

```javascript
// Test that the pagination component displays correctly
it('displays the correct page information', () => {
  render(
    <Pagination 
      currentPage={2} 
      totalPages={5} 
      totalItems={100}
      itemsPerPage={20} 
      currentPageFirstItemIndex={20}
      currentPageLastItemIndex={39}
    />
  );
  
  // Check if it shows "Showing 21 to 40 of 100 items"
  expect(screen.getByText(/Showing 21 to 40 of 100/)).toBeInTheDocument();
});
```

**How to run this test:**
```bash
cd frontend
npm test
```

### Step 3: Add Tests for Your Main Features

Focus on testing the most important features of your application:

1. **Chicken Management**: Test adding, viewing, and updating chickens
2. **Egg Tracking**: Test recording egg production and inventory
3. **Order Processing**: Test creating and fulfilling orders
4. **User Authentication**: Test login and access control

## Testing Templates You Can Use

### Backend API Test Template

```javascript
describe('API Endpoint: [ENDPOINT NAME]', () => {
  it('should [EXPECTED BEHAVIOR]', async () => {
    // Arrange (set up any necessary data)
    
    // Act (make the API request)
    const response = await request(app).get('/api/[your-endpoint]');
    
    // Assert (check the results)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('[EXPECTED PROPERTY]');
  });
});
```

### Frontend Component Test Template

```javascript
describe('[COMPONENT NAME]', () => {
  it('should [EXPECTED BEHAVIOR]', () => {
    // Arrange (render the component with test props)
    render(<YourComponent prop1="value1" />);
    
    // Act (interact with the component if needed)
    fireEvent.click(screen.getByText('Submit'));
    
    // Assert (check the results)
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

## Common Testing Scenarios in Your Project

### 1. Testing Authentication

```javascript
it('should log in with valid credentials', async () => {
  // Arrange: Set up mock credentials
  const credentials = { username: 'testuser', password: 'password123' };
  
  // Act: Make login request
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);
  
  // Assert: Check login success
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('token');
});
```

### 2. Testing Form Submission

```javascript
it('should submit the add chicken form', () => {
  // Render the form
  render(<AddChickenForm onSubmit={mockSubmit} />);
  
  // Fill out the form
  fireEvent.change(screen.getByLabelText(/breed/i), {
    target: { value: 'Leghorn' }
  });
  
  fireEvent.change(screen.getByLabelText(/quantity/i), {
    target: { value: '10' }
  });
  
  // Submit the form
  fireEvent.click(screen.getByText(/add chicken/i));
  
  // Check if onSubmit was called with correct data
  expect(mockSubmit).toHaveBeenCalledWith({
    breed: 'Leghorn',
    quantity: '10'
  });
});
```

## Tips for Successful Testing

1. **Start Small**: Begin with simple tests and gradually add more complex ones.

2. **Test One Thing at a Time**: Each test should verify one specific behavior.

3. **Use Meaningful Test Names**: The test name should describe what you're testing.

4. **Don't Test Everything**: Focus on critical functionality first.

5. **Ask for Help**: If you're stuck, ask your professors or teaching assistants.

## Resources for Learning More

- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Testing Library Tutorial](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)

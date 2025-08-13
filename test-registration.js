// Test registration endpoint
async function testRegistration() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123'
      })
    });

    const data = await response.json();
    console.log('Registration response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRegistration();

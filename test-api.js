import fetch from 'node-fetch';

async function testAPI() {
  try {
    // Test user registration
    console.log('Testing user registration...');
    const registerResponse = await fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!'
      }),
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    // Test user login
    console.log('\nTesting user login...');
    const loginResponse = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!'
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (loginData.token) {
      const token = loginData.token;

      // Test creating a court
      console.log('\nTesting court creation...');
      const courtResponse = await fetch('http://localhost:3000/api/courts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Test Court',
          location: {
            type: 'Point',
            coordinates: [-34.6037, -58.3816]
          },
          address: 'Test Address 123',
          city: 'Buenos Aires',
          neighborhood: 'Palermo',
          surface: 'sand',
          dimensions: {
            width: 8,
            length: 16
          },
          schedule: [
            {
              day: 'monday',
              openTime: '08:00',
              closeTime: '22:00'
            },
            {
              day: 'tuesday',
              openTime: '08:00',
              closeTime: '22:00'
            },
            {
              day: 'wednesday',
              openTime: '08:00',
              closeTime: '22:00'
            },
            {
              day: 'thursday',
              openTime: '08:00',
              closeTime: '22:00'
            },
            {
              day: 'friday',
              openTime: '08:00',
              closeTime: '22:00'
            },
            {
              day: 'saturday',
              openTime: '09:00',
              closeTime: '20:00'
            },
            {
              day: 'sunday',
              openTime: '09:00',
              closeTime: '18:00'
            }
          ],
          responsible: 'John Doe',
          whatsApp: '+5491123456789'
        }),
      });
      
      const courtData = await courtResponse.json();
      console.log('Court creation response:', courtData);

      if (courtData.data && courtData.data._id) {
        const courtId = courtData.data._id;

        // Test getting court details
        console.log('\nTesting get court details...');
        const getCourtResponse = await fetch(`http://localhost:3000/api/courts/${courtId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const getCourtData = await getCourtResponse.json();
        console.log('Get court response:', getCourtData);

        // Test updating court
        console.log('\nTesting court update...');
        const updateResponse = await fetch(`http://localhost:3000/api/courts/${courtId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: 'Updated Test Court',
            surface: 'synthetic',
          }),
        });
        const updateData = await updateResponse.json();
        console.log('Court update response:', updateData);

        // Test searching courts
        console.log('\nTesting court search...');
        const searchResponse = await fetch('http://localhost:3000/api/courts/search?lat=-34.6037&lng=-58.3816&radius=10', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const searchData = await searchResponse.json();
        console.log('Court search response:', searchData);

        // Test requesting affiliation
        console.log('\nTesting court affiliation request...');
        const affiliationResponse = await fetch(`http://localhost:3000/api/courts/${courtId}/request-affiliation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const affiliationData = await affiliationResponse.json();
        console.log('Affiliation request response:', affiliationData);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI(); 
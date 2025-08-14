// Test script to verify password functionality
const testPassword = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/share/6c5513de489265ffc92a249892caf76d08f11d613503cda86ff14bfbaf251b46', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: 'zerocall'
      })
    });

    const data = await response.json();
    console.log('Password verification test:');
    console.log('Status:', response.status);
    console.log('Response:', data);

    if (response.status === 200) {
      console.log('✅ Password verification SUCCESSFUL!');
      
      // Test download
      const downloadResponse = await fetch('http://localhost:3000/api/share/6c5513de489265ffc92a249892caf76d08f11d613503cda86ff14bfbaf251b46/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'zerocall'
        })
      });

      console.log('\nDownload test:');
      console.log('Status:', downloadResponse.status);
      
      if (downloadResponse.status === 200) {
        console.log('✅ Download SUCCESSFUL!');
      } else {
        const downloadError = await downloadResponse.json();
        console.log('❌ Download failed:', downloadError);
      }
    } else {
      console.log('❌ Password verification FAILED!');
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

testPassword();

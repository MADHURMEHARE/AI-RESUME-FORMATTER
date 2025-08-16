// Simple test script to verify frontend-backend connection
const API_BASE_URL = 'http://localhost:5000'

async function testConnection() {
  try {
    console.log('Testing connection to backend...')
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Health check passed:', healthData)
    } else {
      console.log('❌ Health check failed:', healthResponse.status)
    }
    
    // Test CV process endpoint (without file)
    const processResponse = await fetch(`${API_BASE_URL}/api/cv/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    
    if (processResponse.status === 400) {
      console.log('✅ CV process endpoint accessible (expected error for missing file)')
    } else {
      console.log('⚠️ CV process endpoint response:', processResponse.status)
    }
    
    console.log('\n🎉 Backend connection test completed!')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

// Run the test
testConnection()





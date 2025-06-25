// Manual endpoint testing script
import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testEndpoints() {
  try {
    // Test API Info
    const apiInfo = await axios.get(`${BASE_URL}/`);
    
    // Test Health Check
    const health = await axios.get(`${BASE_URL}/health`);
    
    // Test Tasks
    console.log('📋 Testing Tasks Service...');
    
    // Create task
    const taskResponse = await axios.post(`${BASE_URL}/tasks`, {
      title: 'Test Task from Script',
      description: 'Testing endpoint',
      priority: 'high'
    });
    
    // Get tasks
    const tasksResponse = await axios.get(`${BASE_URL}/tasks`);
    
    // Test Habits
    console.log('\n🎯 Testing Habits Service...');
    
    // Create habit
    const habitResponse = await axios.post(`${BASE_URL}/habits`, {
      name: 'Test Habit from Script',
      description: 'Testing endpoint',
      category: 'health',
      target_frequency: 1
    });
    
    // Get habits
    const habitsResponse = await axios.get(`${BASE_URL}/habits`);
    
    // Test Mood
    console.log('\n😊 Testing Mood Service...');
    
    // Create mood entry
    const moodResponse = await axios.post(`${BASE_URL}/mood`, {
      mood_score: 4,
      mood_category: 'content',
      notes: 'Testing from script',
      entry_date: '2025-06-24'
    });
    
    // Get mood analytics
    const analyticsResponse = await axios.get(`${BASE_URL}/mood/analytics?days=30`);
    
    // Test Preferences
    console.log('\n⚙️ Testing Preferences Service...');
    
    // Set preference
    const prefResponse = await axios.post(`${BASE_URL}/preferences`, {
      key: 'test_setting',
      value: 'test_value',
      user_id: 'test_user'
    });
    
    // Get theme
    const themeResponse = await axios.get(`${BASE_URL}/theme?user_id=test_user`);
    
    // console.log('\n🎉 All endpoint tests passed successfully!');
      } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testEndpoints();

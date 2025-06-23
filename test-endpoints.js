// Manual endpoint testing script
import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testEndpoints() {
  console.log('🧪 Testing Meh-trics API Endpoints\n');

  try {
    // Test API Info
    console.log('ℹ️ Getting API Information...');
    const apiInfo = await axios.get(`${BASE_URL}/`);
    console.log('✅ API Name:', apiInfo.data.name);
    console.log('✅ Version:', apiInfo.data.version);
    console.log('✅ Status:', apiInfo.data.status);
    
    // Test Health Check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Status:', health.data.status);
    
    // Test Tasks
    console.log('📋 Testing Tasks Service...');
    
    // Create task
    const taskResponse = await axios.post(`${BASE_URL}/tasks`, {
      title: 'Test Task from Script',
      description: 'Testing endpoint',
      priority: 'high'
    });
    console.log('✅ Created task:', taskResponse.data.task.title);
    
    // Get tasks
    const tasksResponse = await axios.get(`${BASE_URL}/tasks`);
    console.log(`✅ Retrieved ${tasksResponse.data.tasks.length} tasks`);
    
    // Test Habits
    console.log('\n🎯 Testing Habits Service...');
    
    // Create habit
    const habitResponse = await axios.post(`${BASE_URL}/habits`, {
      name: 'Test Habit from Script',
      description: 'Testing endpoint',
      category: 'health',
      target_frequency: 1
    });
    console.log('✅ Created habit:', habitResponse.data.habit.name);
    
    // Get habits
    const habitsResponse = await axios.get(`${BASE_URL}/habits`);
    console.log(`✅ Retrieved ${habitsResponse.data.habits.length} habits`);
    
    // Test Mood
    console.log('\n😊 Testing Mood Service...');
    
    // Create mood entry
    const moodResponse = await axios.post(`${BASE_URL}/mood`, {
      mood_score: 4,
      mood_category: 'content',
      notes: 'Testing from script',
      entry_date: '2025-06-24'
    });
    console.log('✅ Created mood entry with score:', moodResponse.data.mood_entry.mood_score);
    
    // Get mood analytics
    const analyticsResponse = await axios.get(`${BASE_URL}/mood/analytics?days=30`);
    console.log('✅ Retrieved mood analytics');
    
    // Test Preferences
    console.log('\n⚙️ Testing Preferences Service...');
    
    // Set preference
    const prefResponse = await axios.post(`${BASE_URL}/preferences`, {
      key: 'test_setting',
      value: 'test_value',
      user_id: 'test_user'
    });
    console.log('✅ Set preference:', prefResponse.data.preference.preference_key);
    
    // Get theme
    const themeResponse = await axios.get(`${BASE_URL}/theme?user_id=test_user`);
    console.log('✅ Retrieved theme settings');
    
    console.log('\n🎉 All endpoint tests passed successfully!');
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

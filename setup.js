const { initializeDatabase, testConnection } = require('./backend/config/database');

async function setup() {
  console.log('🚀 Setting up Chung Hua Media Management System...');
  console.log('👨‍💻 Developed by Haziq Omar - IT Department\n');

  try {
    // Test database connection
    console.log('📊 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Database connection failed!');
      console.error('Please make sure XAMPP MySQL is running and try again.');
      process.exit(1);
    }

    // Initialize database
    console.log('🔧 Initializing database...');
    await initializeDatabase();

    console.log('✅ Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development servers: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Login with admin@chunghwa.edu.my / admin123');
    console.log('\n🎉 Happy coding!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup(); 
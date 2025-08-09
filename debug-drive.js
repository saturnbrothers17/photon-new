const { seamlessGoogleDrive } = require('./src/lib/seamless-google-drive');

seamlessGoogleDrive.healthCheck()
  .then(ok => {
    console.log('✅ Drive connected:', ok);
  })
  .catch(err => {
    console.error('❌ Drive error:', err.message);
    console.error('Stack:', err.stack);
  });

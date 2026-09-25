require('dotenv').config();
const { scoreApplication } = require('./services/scoringService');

scoreApplication(6) // your application id from earlier
  .then((score) => console.log('Score:', score.toJSON()))
  .catch((err) => console.error('Failed:', err.message));
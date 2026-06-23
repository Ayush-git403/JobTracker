const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
const authRouter = require('./routes/authRouter');
app.use('/api/auth', authRouter);
const jobRouter = require('./routes/jobRouter');
app.use('/api/jobs', jobRouter);

app.get('/', (req, res) => res.json({ message: 'Job Board API Running' }));

const { sequelize } = require('./models');

sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('DB sync error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
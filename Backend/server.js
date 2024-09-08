const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://reyajalam0425:<db_password>@cluster0.u588w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  availability: [{
    start: Date,
    end: Date
  }]
});

const User = mongoose.model('User', UserSchema);


app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.send('User registered');
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ userId: user._id }, 'secretKey');
  res.send({ token });
});


app.post('/availability', async (req, res) => {
  const { token, start, end } = req.body;
  const decoded = jwt.verify(token, 'secretKey');
  const user = await User.findById(decoded.userId);
  user.availability.push({ start, end });
  await user.save();
  res.send('Availability added');
});


app.get('/availability', async (req, res) => {
  const { token } = req.headers;
  const decoded = jwt.verify(token, 'secretKey');
  const user = await User.findById(decoded.userId);
  res.send(user.availability);
});
const port = process.env.PORT || 3000;

app.listen(5000, () => {
  console.log('Server running on MongoDB');
});

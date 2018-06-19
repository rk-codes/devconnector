const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();
const port = process.env.PORT || 5000;

//DB config
const db = require('./config/keys').mongoURI;

//Connect to MongoDB
mongoose.connect(db)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.get('/', (req, res) => res.send('Hello'));

app.listen(port, () => console.log(`Server running on port ${port}`));

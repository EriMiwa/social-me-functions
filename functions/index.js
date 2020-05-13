const functions = require('firebase-functions');

const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { 
  getAllComments, 
  postOneComment 
} = require('./handlers/comments')

const { 
  signup, 
  login 
} = require('./handlers/users')


app.get('/comments', getAllComments);
app.post('/comment', FBAuth, postOneComment);

app.post('/signup', signup);
app.post('/login', login)

exports.api = functions.region('us-central1').https.onRequest(app);

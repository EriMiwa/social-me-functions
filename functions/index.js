const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
  apiKey: "AIzaSyCVXouWUkRBGYgkxi67RhI86YMi6GhMVV0",
  authDomain: "social-me-9e84a.firebaseapp.com",
  databaseURL: "https://social-me-9e84a.firebaseio.com",
  projectId: "social-me-9e84a",
  storageBucket: "social-me-9e84a.appspot.com",
  messagingSenderId: "997553938765"
}

const firebase = require('firebase');
firebase.initializeApp(config);

app.get('/comments', (req,res) => {
  admin
    .firestore()
    .collection('comments')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let comments = [];
      data.forEach(doc => {
        comments.push({
          commentId: doc.id,
          body: doc.data().body,
          userHandle: doc.data.userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(comments)
    })
    .catch((err) => console.error(err))
})

app.post('/comment', (req,res) => {
  const newComment = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  admin
    .firestore()
    .collection('comments')
    .add(newComment)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully`});
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    })
})

app.post('/signup', (req,res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res.status(201).json({ message: `user ${data.user.uid} signed up successfully`})
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code})
    })
})

exports.api = functions.https.onRequest(app)

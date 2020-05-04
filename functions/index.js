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

const db = admin.firestore();

app.get('/comments', (req,res) => {
  db
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
});

app.post('/comment', (req,res) => {
  const newComment = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db
    .collection('comments')
    .add(newComment)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully`});
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    })
});

app.post('/signup', (req,res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if(doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken"})
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({email: 'Email is already in use'})
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.region('us-central1').https.onRequest(app);

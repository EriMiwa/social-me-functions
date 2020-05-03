const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/comments', (req,res) => {
  admin
  .firestore()
  .collection('comments')
  .get()
  .then(data => {
    let comments = [];
    data.forEach(doc => {
      comments.push(doc.data());
    });
    return res.json(comments)
  })
  .catch((err) => console.error(err))
})

app.post('/comment', (req,res) => {
  const newComment = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
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

exports.api = functions.https.onRequest(app)

const { db } = require('../util/admin');

exports.getAllComments = (req,res) => {
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
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount
        });
      });
      return res.json(comments)
    })
    .catch((err) => console.error(err))
    res.status(500).json({ error: err.code })
}

exports.getAllComments = (req,res) => {
  if(req.body.body.trim() === '') {
    return res.status(400).json({body: 'Body must not be empty'});
  }

  const newComment = {
    body: req.body.body,
    userHandle: req.user.handle,
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
}
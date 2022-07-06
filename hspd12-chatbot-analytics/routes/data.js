var express = require('express');
var router = express.Router();
const admin = require('firebase-admin');
// const serviceAccount = require('../service-account-hspd12-dev.json');
// const serviceAccount = process.env.serviceAccount;
const cors = require('cors');
var app = express();

app.use(cors());

let logs = [];
let logs2 = [];

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

initializeApp();

const db = getFirestore().collection('logs'); 

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();

function addToArray(dataPiece) {
  logs.push(dataPiece);
}

router.get('/:startDate/:endDate', async function (req, res, next) {
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;

  let startDateX = new Date(startDate);
  let endDateX = new Date(endDate);
  let dataPiece;
  //clear out logs from previous query
  logs2 = [];

  await db.collection('logs').where('timestamp', '>', startDateX).where('timestamp', '<', endDateX).get().then((querySnapshot) => {
    querySnapshot.docs.forEach(doc => {
      addToArray(doc.data());
      console.log("await");
    })
  })
  setTimeout(function () {
    console.log("data.js");
    //assign logs to the value we return
    logs2 = logs;
    //clear out queried logs
    logs = [];
    //return logs for current query
    res.json({
      queriedLogs: logs2
    })
  }, 1.0 * 1000)


});

module.exports = router;

'use strict';

const FirestoreBackup = require('../src/firestoreBackup');

const admin = require('firebase-admin'),
  config = {
    apiKey: "",
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
    projectId: process.env.GCLOUD_PROJECT,
  };

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...config,
});

let backupClient = new FirestoreBackup(admin);

async function testCollection() {
  let results = await backupClient.start('resources');
  console.log(JSON.stringify(results, null, 2));
}

async function testDocument() {
  let results = await backupClient.start('resources/m11A3P41RhzSC4hzboas');
  console.log(JSON.stringify(results, null, 2));
}

testCollection()
  .catch(err => console.error(err));
testDocument()
  .catch(err => console.error(err));

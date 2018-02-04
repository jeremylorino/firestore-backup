# Firestore Backup Utility  

Exports all Firestore Documents and Collections, including subcollections, to JSON.  

The examples below can also be found in [test/index.js](./test/index.js).  

## Example using a root collection path  

```javascript
const FirestoreBackup = require('firestore-backup'),
  admin = require('firebase-admin'),
  config = {
    apiKey: "YOUR-API-KEY",
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
    projectId: process.env.GCLOUD_PROJECT,
  };

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...config,
});

let backupClient = new FirestoreBackup(admin);

backupClient.start('resources')
  .then((results)=>{
    console.log(JSON.stringify(results, null, 2));
  });
```  

Output  

```json
{
  "resources": [
    {
      "documentPath": "resources/KprVstTOimvAoofBzZzV",
      "id": "KprVstTOimvAoofBzZzV",
      "name": "resource2",
      "type": "bar"
    },
    {
      "documentPath": "resources/m11A3P41RhzSC4hzboas",
      "id": "m11A3P41RhzSC4hzboas",
      "name": "resource1",
      "type": "foo",
      "permissions": [
        {
          "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/admin",
          "id": "admin",
          "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
        },
        {
          "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/get",
          "id": "get",
          "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
        },
        {
          "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/list",
          "id": "list",
          "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
        },
        {
          "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/read",
          "id": "read",
          "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
        }
      ]
    }
  ]
}
```

## Example using a document path  

```javascript
const FirestoreBackup = require('firestore-backup'),
  admin = require('firebase-admin'),
  config = {
    apiKey: "YOUR-API-KEY",
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
    projectId: process.env.GCLOUD_PROJECT,
  };

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...config,
});

let backupClient = new FirestoreBackup(admin);

backupClient.start('resources/m11A3P41RhzSC4hzboas')
  .then((results)=>{
    console.log(JSON.stringify(results, null, 2));
  });
```  

Output  

```json
{
  "documentPath": "resources/m11A3P41RhzSC4hzboas",
  "id": "m11A3P41RhzSC4hzboas",
  "name": "resource1",
  "type": "foo",
  "permissions": [
    {
      "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/admin",
      "id": "admin",
      "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
    },
    {
      "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/get",
      "id": "get",
      "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
    },
    {
      "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/list",
      "id": "list",
      "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
    },
    {
      "documentPath": "resources/m11A3P41RhzSC4hzboas/permissions/read",
      "id": "read",
      "jeremylorino@gmail.com": "users/jeremylorino@gmail.com"
    }
  ]
}
```  

'use strict';

const isEmpty = require('lodash.isempty'),
  hasIn = require('lodash.hasin'),
  transform = require('lodash.transform'),
  merge = require('lodash.merge'),
  map = require('lodash.map'),
  mapValues = require('lodash.mapvalues'),
  { sanitize, firestoreTypes } = require('./util'),
  { ResourcePath } = require('@google-cloud/firestore/src/path');

class FirestoreBackup {
  constructor(firebaseAdmin, startAtDocumentPath) {
    if (!firestoreTypes.isFirebaseNamespace(firebaseAdmin) && !hasIn(firebaseAdmin, 'firestore')) {
      throw new Error(`Parameter 'firebaseAdmin' is invalid.`);
    }

    this.firebaseAdmin = firebaseAdmin;
    this.firebaseConfig = this.firebaseAdmin.app().options_;
    this.db = this.firebaseAdmin.firestore();
    this.startAtDocumentPath = startAtDocumentPath;
    this.baseReference = new ResourcePath(this.firebaseConfig.projectId, '(default)');
  }

  static get REF() {
    return Symbol.for('ref');
  }

  getRootDocumentRef(startAtDocumentPath) {
    if (isEmpty(startAtDocumentPath))
      return this.db;

    let path = this.baseReference.append(startAtDocumentPath);

    if (path.isDocument)
      return this.db.doc(startAtDocumentPath);
    if (path.isCollection)
      return this.db.collection(startAtDocumentPath);

    throw new Error(`Parameter 'startAtDocumentPath' is invalid.`);
  }

  async getDocumentData(rootDocumentRef) {
    if (firestoreTypes.isFirestore(rootDocumentRef))
      return {};

    let doc = firestoreTypes.isDocumentReference(rootDocumentRef) ?
      (await rootDocumentRef.get()) :
      rootDocumentRef;
    let subCollections = await this.getCollections(doc.ref);
    let docData = {
      [FirestoreBackup.REF]: rootDocumentRef,
      documentPath: doc.ref.path,
      id: doc.id,
      ...(doc.exists ? doc.data() : {}),
    };

    if (Object.keys(subCollections).length)
      docData = merge({}, docData, subCollections);

    return docData;
  }

  async getCollections(rootDocumentRef) {
    let subCollections = await rootDocumentRef.getCollections();

    return mapValues(
      transform(
        await Promise.all(
          map(subCollections, async(v) => {
            return {
              [v.id]: await this.getDocuments(v)
            };
          })
        ), merge, {}),
      sanitize);

    /*return _(
        await Promise.all(
          map(subCollections, async(v) => {
            return {
              [v.id]: await this.getDocuments(v)
            };
          })
        )
      )
      .transform(merge, {})
      .mapValues(sanitize)
      .value();*/
  }

  async getDocuments(rootCollectionsRef) {
    let docs = (await rootCollectionsRef.get()).docs;
    return await Promise.all(map(docs, (v) => this.getDocumentData(v)));
  }

  async start(startAtDocumentPath) {
    this.startAtDocumentPath = startAtDocumentPath || this.startAtDocumentPath;
    let rootDocumentRef = await this.getRootDocumentRef(this.startAtDocumentPath);
    let data, subCollections;

    if (firestoreTypes.isDocumentReference(rootDocumentRef)) {
      data = await this.getDocumentData(rootDocumentRef);
      subCollections = await this.getCollections(rootDocumentRef);

      return {
        ...merge({}, mapValues(data, sanitize), subCollections),
      };
    }

    data = await this.getDocuments(rootDocumentRef);

    return {
      ...mapValues({
              [rootDocumentRef.id]: await this.getDocuments(rootDocumentRef)
      }, sanitize),
    };
  }
}

module.exports = FirestoreBackup;

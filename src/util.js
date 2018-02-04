'use strict';

const _ = require('lodash');

/**
 * Assigns all properties of type Function from one object to another.
 * 
 * @param {object} destination - The destination object.
 * @param {object} source - The source object.
 * 
 * @example
 * const { copyExports } = require('./util');
 * var source = {
 *   prop1: 1,
 *   func1: function func1() {},
 *   func2: function func2() {},
 * };
 * var destination = {};
 * 
 * copyExports(source, destination);
 * 
 * console.log('source', source);
 * // source { prop1: 1, func1: [Function: func1], func2: [Function: func2] }
 * 
 * console.log('destination', destination);
 * // destination { func1: [Function: func1], func2: [Function: func2] }
 */
module.exports.copyExports = function copyExports(source, destination) {

  _.forOwn(source, (v, k) => {
    _.isFunction(v) && (destination[k] = v);
  });
};

const firestoreTypes = {
  isFirebaseNamespace: _.matchesProperty('constructor.name', 'FirebaseNamespace'),
  isFirestore: _.matchesProperty('constructor.name', 'Firestore'),
  isDocumentSnapshot: _.matchesProperty('constructor.name', 'DocumentSnapshot'),
  isDocumentReference: _.matchesProperty('constructor.name', 'DocumentReference'),
  isCollectionReference: _.matchesProperty('constructor.name', 'CollectionReference'),
  isQuerySnapshot: _.matchesProperty('constructor.name', 'QuerySnapshot'),
};
module.exports.firestoreTypes = firestoreTypes;
const sanitizeSteps = _.cond(
[
  [firestoreTypes.isDocumentSnapshot, _.property('ref.path')],
  [firestoreTypes.isDocumentReference, _.property('path')],
  [firestoreTypes.isCollectionReference, _.property('path')],
  [firestoreTypes.isQuerySnapshot, (v) => _.map(v, sanitize)],
  [_.stubTrue, (data, key) => {
      if (_.isObjectLike(data)) {
        if (_.isArray(data))
          return _.map(data, sanitize);
        if (_.isDate(data))
          return data.toJSON();
        
        return _.mapValues(data, (val, k) => {
          return _.cond(
          [
            [_.isDate, _.method('toJSON')],
            [(v) => _.isObjectLike(v) && !_.isArray(v), sanitize],
            [_.isArray, (v) => _.map(v, sanitize)],
            [_.stubTrue, _.constant(val)],
          ])(val);
        });
      }
      
      return data;
  }],
]);
const sanitize = (v, k) => sanitizeSteps(v, k);
module.exports.sanitize = sanitize;

function diffDocumentChangeData(event) {
  try {
    let data = {
      refPath: (event.data || event.data.previous).ref.path,
      currentData: {
        createTime: event.data.createTime,
        data: null,
        exists: event.data.exists,
        id: event.data.id,
        updateTime: event.data.updateTime,
      },
      previousData: {
        data: null,
        exists: false,
        id: null,
        createTime: null,
        updateTime: null,
      },
    };

    if (event.data.exists) {
      data.currentData.data = _.mapValues(event.data.data(), sanitize);
    }

    if (event.data.previous) {
      data.previousData = {
        data: _.mapValues(event.data.previous.data(), sanitize),
        exists: event.data.previous.exists,
        id: event.data.previous.id,
        createTime: event.data.previous.createTime,
        updateTime: event.data.previous.updateTime,
      };
    }

    data.diff = _.map(
      _.fromPairs(
        _.xorWith(
          _(data.previousData.data).toPairs().value(),
          _(data.currentData.data).toPairs().value(),
          _.isEqual
        )
      ),
      (v, k) => {
        let fromVal = data.previousData.data[k];
        let toVal = data.currentData.data[k];

        return {
          key: k,
          change: {
            from: _.defaultTo(fromVal, null),
            to: _.defaultTo(toVal, null),
          },
        };
      });

    return data;
  }
  catch (err) {
    console.error(err);
  }

  return null;
}
module.exports.diffDocumentChangeData = diffDocumentChangeData;

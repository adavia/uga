"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const renameField = exports.renameField = (result, field, newField) => {
  if (result.length > 0) {
    return result.map(r => {
      r[newField] = r[field];
      delete r[field];
    });
  } else {
    result[newField] = result[field];
    delete result[field];

    return result;
  }
};
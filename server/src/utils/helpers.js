export const renameField = (result, field, newField) => {
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
}

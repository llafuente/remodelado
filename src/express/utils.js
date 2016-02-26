module.exports = {
  type_can_be_populated: type_can_be_populated
};

// it's an ObjectId or is a list of ObjectId
function type_can_be_populated(type) {
  if ("function" === typeof type) {
    return 'ObjectId' !== type.schemaName;
  }

  if (Array.isArray(type) && type.length === 1) {
      type = type[0];
      if ("function" === typeof type) {
        return 'ObjectId' !== type.schemaName;
      }
  }

  return false;
}

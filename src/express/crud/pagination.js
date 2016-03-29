'use strict';

module.exports = function Pagination(count,  offset,  limit,  list) {
  this.count = count;
  this.offset = offset;
  this.limit = limit;
  this.list = list;
};

var console = require("console");

var untilde = function(str) {
  return str.replace(/~./g, function(m) {
    switch (m) {
      case "~0":
        return "~";
      case "~1":
        return "/";
    }
    throw("Invalid tilde escape: " + m);
  });
}

var compile = function(pointer) {
  if(pointer === "") {
    pointer = [];
  } else {
    if(!pointer) {
      throw("Invalid JSON pointer.");
    }

    pointer = pointer.split("/");
    var first = pointer.shift();
    if (first !== "") {
      throw("Invalid JSON pointer.");
    }
  }

  var len = pointer.length;
  if (len === 0) {
    return function(obj, value) {
      if (typeof value !== 'undefined') {
        throw(new Error('Invalid JSON pointer for set.'));
      }
      return obj;
    }
  }

  pointer = pointer.map(untilde);

  return function(obj, value) {
    var parent = null;
    var part = null;
    for (var i=0; i<len; i++) {
      if (!obj) {
        if (typeof value !== 'undefined') {
          throw new Error("Path not found for set");
        }
        return null;
      }
      parent = obj;
      part = pointer[i];
      obj = obj[part];
    }

    if (typeof value !== 'undefined') {
      parent[part] = value;
    }
    return obj;
  }
}

var get = function(obj, pointer) {
  pointer = compile(pointer);
  return pointer(obj);
}

var set = function(obj, pointer, value) {
  pointer = compile(pointer);
  return pointer(obj, value);
}

exports.get = get
exports.set = set
exports.compile = compile;

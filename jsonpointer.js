var console = require("console");

exports.use_cache = true;

var cache = {
  "": function(obj, value) {
        if (typeof value !== 'undefined') {
          throw(new Error('Invalid JSON pointer for set.'));
        }
        return obj;
      }
};

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
  if (typeof pointer !== 'string') {
    // This will catch null and undefined as well.
    throw(new Error("Invalid JSON pointer."))
  }

  if (exports.use_cache) {
    var cf = cache[pointer];
    if (cf) { return cf; }
  } else if (pointer === "") {
    return cache[""];
  }

  var aptr = pointer.split("/");
  if (aptr.shift() !== "") {
    throw("Invalid JSON pointer.");
  }

  var len = aptr.length;
  aptr = aptr.map(untilde);

  var f = function(obj, value) {
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
      part = aptr[i];
      obj = obj[part];
    }

    if (typeof value !== 'undefined') {
      parent[part] = value;
    }
    return obj;
  }
  if (exports.use_cache) {
    cache[pointer] = f;
  }
  return f;
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

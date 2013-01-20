var console = require("console");

var untilde = function(str) {
  return str.replace(/(~.)|[\b\f\n\r\t\v\\']/g, function(m) {
    switch (m) {
      case "~0":
        return "~";
      case "~1":
        return "/";
      case "'":
        return "\\'";
      case "\b":
        return "\\b";
      case "\f":
        return "\\f";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\t":
        return "\\t";
      case "\v":
        return "\\v";
      case "\\":
        return "\\\\";
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

  var fn = "";
  var part;
  var len = pointer.length - 1;
  if (len < 0) {
    fn += "if (typeof value !== 'undefined') { throw(new Error('Invalid JSON pointer for set.')); }\n";
  } else {
    for (var i=0; i<len; i++) {
      part = untilde(pointer[i]);
      fn += "if (!obj) { return null; }\n";
      fn += "obj = obj['" + part + "'];\n"
    }
    part = untilde(pointer[len]);
    fn += "if (!obj) { return null; }\n";
    fn += "if (typeof value !== 'undefined') {\n" +
          "  var old_value = obj['" + part + "'];\n" +
          "  obj['" + part + "'] = value;\n" +
          "  obj = old_value;\n" +
          "} else {\n" +
          "  obj = obj['" + part + "'];\n" +
          "}\n";
  }

  fn += "return obj;\n"
  return new Function("obj", "value", fn);
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

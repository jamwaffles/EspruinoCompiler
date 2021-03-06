var utils = require("./utils.js");
var acorn_walk = require("acorn/dist/walk");

function infer(node, forceUndefined) {
  // forceUndefined = treat unknown types as JsVars
  var modified = undefined;
  
  function setType(node, type) {
    if (node.varType !== type) {      
      if (!modified) modified = [];
      modified.push([ node.varType + " -> " + type, node, (new Error()).stack]);
      node.varType = type;
    }
  }
  function getType(node) {
    if (forceUndefined && !node.varType)
      return "JsVar";
    return node.varType;
  }
  
  var varTypes = {};
  function updateVarType(name, type, node) {
    if (type===undefined) return;
    if (varTypes[name]===undefined) {
      varTypes[name] = type;
    } else {
      varTypes[name] = utils.maxType(varTypes[name], type);
    }
  }
  
  // Look for assigns/inits to basic variables
  acorn_walk.simple(node, {
    "AssignmentExpression" : function (node) {
      if (node.left.type == "Identifier") {
        // if not declared first, it's pulled in from interpreter so is a JsVar
        if (varTypes[node.left.name] === undefined)
          varTypes[node.left.name] = "JsVar";
        updateVarType(node.left.name, getType(node.right), node);
      }
    },
    "VariableDeclaration" : function (node) {
      node.declarations.forEach(function(node) {
        if (node.init)
          updateVarType(node.id.name, getType(node.init), node);
      });
    }
  });  
  /* Any identified that's just mentioned needs to be loaded from
   the interpreter, so is def. a JsVar */ 
  acorn_walk.simple(node, {
    "Identifier" : function (node) {
      if (varTypes[node.name] === undefined)
        varTypes[node.name] = "JsVar";
    }
  });    
  
  acorn_walk.simple(node, {
    "Identifier" : function(node) {
      if (varTypes[node.name]!==undefined)
        setType(node, varTypes[node.name]);
      else if (forceUndefined) {
        varTypes[node.name] = "JsVar";
        setType(node, varTypes[node.name]);
      }        
    },
    "Literal" : function(node) {
      node.isNotAName = true;
      if (utils.isInt(node.value)) setType(node, "int"); 
      else if (utils.isBool(node.value)) setType(node, "bool");
      else setType(node, "JsVar");
    },
    "BinaryExpression" : function(node) {
      node.isNotAName = true;
      var boolExprs = ["==","===","!=","!==","<","<=",">",">="];
      var intExprs = ["&","|","^"];
      var floatExprs = ["/"];
      if (boolExprs.indexOf(node.operator)>=0) setType(node, "bool");
      else if (intExprs.indexOf(node.operator)>=0) setType(node, "int");
      else if (floatExprs.indexOf(node.operator)>=0) setType(node, "JsVar");
      else { // normal operator - do type promotion
        setType(node, utils.maxType(getType(node.left), getType(node.right)));
      }
    },
    "LogicalExpression" : function(node) {
      setType(node, utils.maxType(getType(node.left), getType(node.right)));
    },
    "ConditionalExpression" : function(node) {
      node.isNotAName = true;
      setType(node.test, "bool");
      setType(node, utils.maxType(getType(node.consequent), getType(node.alternate)));
    },    
    "IfStatement" : function(node) {
    },
    "WhileStatement" : function(node) {
    },
    "ForStatement" : function(node) {
    },
    "AssignmentExpression" : function (node) {
    },
    "VariableDeclaration" : function (node) {
      node.declarations.forEach(function(node) {
        if (varTypes[node.id.name]!==undefined)
          setType(node.id, varTypes[node.id.name]);
      });
    }
  });
  if (modified) {
    console.log("Modified "+JSON.stringify(modified,null,2));
  } else {
    console.log("Variable types: "+JSON.stringify(varTypes,null,2));
  }
  
  return modified!==undefined;
}
    
exports.infer = function(node) {
  // Try and work out types without forcing anything 
  tries = 20;
  while (infer(node, false) && tries--);
  if (tries<=0) throw new Error("Infer(unforced) kept changing stuff");
  // now just assume that anything we're not sure about is a JsVar
  tries = 20;
  while (infer(node, true) && tries--);
  if (tries<=0) throw new Error("Infer(forced) kept changing stuff");
  
  
  // now output
  console.log(JSON.stringify(node,null,2));
}

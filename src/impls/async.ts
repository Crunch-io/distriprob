"use strict";

/**
 * Created by zacharymartin on August 16, 2016.
 */

export function asyncGen(functionDependencies, script, scriptArgs){
  let worker;

  if (isNode()) {
    const scriptString = createScriptStr(functionDependencies, script, scriptArgs, true);
    const Worker = require("webworker-threads").Worker;
    const functionArg = new Function(scriptString);
    worker = new Worker(functionArg);
  } else {
    const scriptString = createScriptStr(functionDependencies, script, scriptArgs, false);
    const blobURL = URL.createObjectURL(new Blob([scriptString],
                                                 {type: "application/javascript"}));
    worker = new Worker(blobURL);
    URL.revokeObjectURL(blobURL);
  }

  return new Promise((resolve, reject) => {
    worker.onmessage = function(event){
      worker.terminate();
      resolve(event.data);
    };
    worker.postMessage("get to work!");
  });
}

function createScriptStr(functionDependencies: any,
                         script:() => number,
                         scriptArgs: any[],
                         node: boolean){
  let argString = "";

  for (let i = 0; i < scriptArgs.length; i++){
    let arg = scriptArgs[i];
    argString += arg.toString();
    if (i < (scriptArgs.length - 1)) {
      argString += ", ";
    }
  }

  let result = "";
  for(let funct of functionDependencies){
    result += funct.toString() + "\n";
  }

  result += "let result = (" + script.toString() + ")(" + argString + ");\n";

  if (node) {
    result += "self.onmessage = function(event) {\n";
  } else {
    result += "self.onmessage = function(event) {\n";
  }
  result += "postMessage(result);\n";
  result += "};\n";

  return result;
}

function isNode(): boolean {
  return typeof process === "object" && process + "" === "[object process]";
}


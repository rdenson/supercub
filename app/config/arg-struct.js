/*
 * Module to parse command-line arguments into an organized structure.
 */
 var acceptedArguments = [];

//argo - argument object
function argo(argName, argValue) {
  this.name = argName;
  this.value = argValue;

  return this;
}

//argo's prototype collection
argo.prototype = {
  //check the argument name against an argument whitelist
  isAccepted: function() {
    var found = false,
        itr = 0;

    //we'll need some arguments enumerated...
    if( acceptedArguments.length > 0 ){
      while( !found && itr < acceptedArguments.length ){
        found = acceptedArguments[itr] == this.name;
        itr++;
      }
    } else {
      //otherwise everything is permitted
      found = true;
    }

    return found;
  }
}

//main "class" returned; walks through a set of command-line arguments to return
//a javascript object of argument name/value pairs
function ArgStruct(argv) {
  this.parsed = {};

  return this;
}

ArgStruct.prototype = {
  distillArgument: function(argPair) {
    //arguments take the form: --NAME value
    var argPair = argPair.split('=');
    var argName = argPair[0].slice(2, argPair[0].length);

    return new argo(argName, argPair[1])
  },
  parse: function(argv) {
    var argsFound = argv.length;

    //do we have arguments to parse?
    if( argsFound > 2 ){
      //examine each argument
      for(i = 2; i < argsFound; i++){
        var currentArg = this.distillArgument(argv[i]);

        if( currentArg.isAccepted() ){
          this.parsed[currentArg.name] = currentArg.value;
        }
      }
    }

    return this.parsed;
  },
  setAcceptedArguments: function(argumentArray) {
    //sever the reference
    acceptedArguments = argumentArray.slice(0);
  }
}


module.exports = ArgStruct;

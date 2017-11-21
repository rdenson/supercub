var argStruct = require('./arg-struct'),
    extend = require('extend');


function AppConfig(commandLineArgs) {
  var HOUR_SECONDS = 3600;
  var args = new argStruct(),
      argList = ['environment', 'port'];

  args.setAcceptedArguments(argList);
  args.parse(commandLineArgs);

  //default configuration
  this.persistence = {
    database: 'supercub',
    instance: '192.168.7.2',
    options: {
      useMongoClient: true,
      poolSize: 10
    }
  };
  this.environment = 'local';
  this.port = 8014;
  this.session = {
    instance: '192.168.7.2',
    timeout: HOUR_SECONDS
  };

  for(name in args.parsed){
    switch(name) {
      case 'environment':
        this.environment = args.parsed[name]
        break;
      case 'port':
        this.port = args.parsed[name]
        break;
    }
  }

  return this;
}

AppConfig.prototype = {
  getDbConnectionOptions: function() {
    return extend(true, {}, this.persistence.options);
  },
  getMongoUri: function() {
    return 'mongodb://' + this.persistence.instance + '/' + this.persistence.database
  },
  getRedisConnectionOptions: function() {
    return {
      host: this.session.instance,
      port: 6379
    };
  }
};


module.exports = AppConfig;

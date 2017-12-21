var argStruct = require('./arg-struct'),
    extend = require('extend');


function AppConfig(commandLineArgs) {
  var HOUR_SECONDS = 3600;
  var args = new argStruct(),
      argList = ['db-instance', 'db-name', 'environment', 'port'];

  args.setAcceptedArguments(argList);
  args.parse(commandLineArgs);

  //default configuration
  this.persistence = {
    //TODO: pull this from a secrets store
    credentials: [
      '#####',
      '#####'
    ],
    database: 'supercub',
    instance: '192.168.7.2',
    options: {
      autoIndex: false,
      bufferMaxEntries: 0,
      poolSize: 10,
      useMongoClient: true
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
      case 'db-instance':
        this.persistence.instance = args.parsed[name];
        break;
      case 'db-name':
        this.persistence.database = args.parsed[name];
        break;
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
    var base = 'mongodb://',
        creds = this.persistence.credentials[0] + ':' + encodeURIComponent(this.persistence.credentials[1]),
        location = '@' + this.persistence.instance;

    return base + creds + location + '/' + this.persistence.database;
  },
  getRedisConnectionOptions: function() {
    return {
      host: this.session.instance,
      port: 6379
    };
  }
};


module.exports = AppConfig;

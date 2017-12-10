var body_parser = require('body-parser'),
    config = require('./config/app'),
    database = require('./db/database'),
    express = require('express'),
    mongoose = require('mongoose'),
    redis = require("redis"),
    router = require('./routes/router');
var appconfig = new config(process.argv),
    consoServer = express();


consoServer.set('title', 'SuperCub -->> EHR');
consoServer.set('env', appconfig.environment);
consoServer.use(body_parser.urlencoded({
  extended: true
}));
consoServer.use(body_parser.json());
consoServer.use(express.static(__dirname + '/public'));

mongoose.Promise = require('q').Promise;
//connect to the database
mongoose.connect(appconfig.getMongoUri(), appconfig.getDbConnectionOptions(), function(connectionError) {
  if( connectionError != null ){
    console.log('EHRLOG ' + consoServer.get('env') + ' [fatal] - failed to connect to the database');
    console.log(connectionError);
    process.exit(1);
  }

  var redisClient = redis.createClient(appconfig.getRedisConnectionOptions());
  //connect to the cache
  redisClient.on('ready', function() {
    consoServer.set('session', redisClient);
    consoServer.set('sessionTimeout', appconfig.session.timeout);
    consoServer.set('database', mongoose);

    //database and cache are available...
    //server can now start
    consoServer.listen(appconfig.port, function() {
      console.log('EHRLOG ' + consoServer.get('env') + ' [info] - ' + consoServer.get('title') + ' starting...');
      console.log('EHRLOG ' + consoServer.get('env') + ' [info] - server running on port ' + appconfig.port);
      console.log('EHRLOG ' + consoServer.get('env') + ' [info] - connected to database: ' + appconfig.persistence.database);
      console.log('EHRLOG ' + consoServer.get('env') + ' [info] - redis server [' + redisClient.server_info.redis_mode + '] version: ' + redisClient.server_info.redis_version + ', connected and ready to use');

      //handler entry points
      database.handleDocuments(consoServer);
      router.handleRequests(consoServer);
    });
  });
  redisClient.on('error', function(redisError) {
    console.log('EHRLOG ' + consoServer.get('env') + ' [error] - error from the redis client');
    console.log(redisError);
  });
});

var body_parser = require('body-parser'),
    config = require('./config/app'),
    express = require('express'),
    mongoose = require('mongoose'),
    redis = require("redis"),
    router = require('./routes/router');
var appconfig = new config(process.argv),
    consoServer = express();


consoServer.set('title', 'Quick -->> EHR');
consoServer.set('env', appconfig.environment);
consoServer.use(body_parser.urlencoded({
  extended: true
}));
consoServer.use(body_parser.json());
consoServer.use(express.static(__dirname + '/public'));

mongoose.Promise = require('q').Promise;
mongoose.connect(appconfig.getMongoUri(), appconfig.getDbConnectionOptions(), function(connectionError) {
  if( connectionError != null ){
    console.log('EHRLOG ' + consoServer.get('env') + ' [fatal] - failed to connect to the database');
    console.log(connectionError);
    process.exit(1);
  }

  var redisClient = redis.createClient(appconfig.getRedisConnectionOptions());
  redisClient.on('ready', function() {
    consoServer.set('session', redisClient);
    consoServer.set('sessionTimeout', appconfig.session.timeout);
    console.log('EHRLOG ' + consoServer.get('env') + ' [info] - redis server [' + redisClient.server_info.redis_mode + '] version: ' + redisClient.server_info.redis_version + ', connected and ready to use');
  });
  redisClient.on('error', function(redisError) {
    console.log('EHRLOG ' + consoServer.get('env') + ' [error] - error from the redis client');
    console.log(redisError);
  });

  consoServer.set('database', mongoose);
  consoServer.listen(appconfig.port, function() {
    console.log('EHRLOG ' + consoServer.get('env') + ' [info] - ' + consoServer.get('title') + ' starting...');
    console.log('EHRLOG ' + consoServer.get('env') + ' [info] - server running on port ' + appconfig.port);
    console.log('EHRLOG ' + consoServer.get('env') + ' [info] - connected to database: ' + appconfig.persistence.database);

    router.handleRequests(consoServer);
  });
});

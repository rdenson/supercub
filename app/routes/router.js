var blake = require('blakejs'),
    childProcess = require('child_process'),
    uuid = require('uuid');


function handler(svr) {
  svr.get('/index', function(req, res, nxt) {
    res.send('<h1>Welcome to the index!</h1>');
  });

  svr.get('/v1/user', function(request, response) {
    var session = svr.get('session'),
        token = request.headers.token || '';

    session.get(token, function(err, reply) {
      response.json({ session: reply });
    });
  });

  svr.post('/v1/auth/user/:userid', function(request, response) {
    if( request.body.knowncred == undefined ){
      console.log('EHRLOG ' + svr.get('env') + ' [warning] - could not authenticate ' + request.params.userid + ', password not given');
      response.status(401).json({ message: 'your credentials could not be verified' });
      return;
    }

    var userid = request.params.userid,
        passIn = blake.blake2bHex(request.body.knowncred),
        session = svr.get('session');

    AppUser.findOne({ 'uid': userid }, 'uid cred').then(
      function(queryResult) {
        if( queryResult == null ){
          console.log('EHRLOG ' + svr.get('env') + ' [warning] - could not authenticate ' + userid + ', user not found');
          response.status(401).json({ message: 'your credentials could not be verified' });
          return;
        }

        var sessionObject = {
              id: queryResult._id,
              userid: userid
            },
            userToken = uuid.v1();

        AppUser.findByIdAndUpdate(queryResult._id, { $set: { 'dates.lastTry': new Date() } }, function(err) {
          if( err != null ){
            console.log('EHRLOG ' + svr.get('env') + ' [error] - could not update lastTry field for ' + userid);
            console.log(err);
          }
        });

        if( passIn == queryResult.cred ){
          console.log('EHRLOG ' + svr.get('env') + ' [info] - credentials for ' + userid + ' validated, issuing session token');
          session.set(userToken, JSON.stringify(sessionObject), 'EX', svr.get('sessionTimeout'), function(err) {
            if( err != null ){
              console.log('EHRLOG ' + svr.get('env') + ' [error] - redis command SET failed for key: ' + token);
              console.log(err);
            }
          });
          AppUser.findByIdAndUpdate(queryResult._id, { $set: { 'dates.lastSuccessfulAccess': new Date() } }, function(err) {
            if( err != null ){
              console.log('EHRLOG ' + svr.get('env') + ' [error] - could not update lastSuccessfulAccess field for ' + userid);
              console.log(err);
            }
          });

          response.status(201).json({ token: userToken });
        } else {
          console.log('EHRLOG ' + svr.get('env') + ' [warning] - invalid password for ' + userid);
          response.status(401).json({ message: 'your credentials could not be verified' });
        }
      },
      function(err) {
        console.log('EHRLOG ' + svr.get('env') + ' [error] - could not complete query in POST /v1/auth/user/' + userid);
        console.log(err);
        response.status(500).json({ message: 'error while searching for user' });
      }
    );
  });

  svr.post('/v1/auth/user/:userid/destroy', function(request, response) {
    var session = svr.get('session'),
        token = request.headers.token,
        userid = request.params.userid;

    session.del(token, function(err, reply) {
      if( err != null ){
        console.log('EHRLOG ' + svr.get('env') + ' [error] - redis command DEL failed for key: ' + token);
        console.log(err);
        response.status(500).json({ message: 'could not remove ' + token + ' from cache' });
        return;
      }

      if( reply > 0 ){
        console.log('EHRLOG ' + svr.get('env') + ' [info] - logout; removed ' + userid + '\'s token: ' + token);
        response.end();
      } else{
        console.log('EHRLOG ' + svr.get('env') + ' [debug] - token: ' + token + ', not found... nothing to do');
        response.end();
      }
    });
  });

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  var db = svr.get('database');
  var appuserSchema = db.Schema({
    uid: String,
    cred: String,
    dates: {
      lastSuccessfulAccess: Date,
      lastTry: Date
    },
    active: Boolean
  });
  var AppUser = db.model('AppUser', appuserSchema);

  svr.get('/db/v1/user/:userid', function(request, response) {
    var userQuery = { 'uid': request.params.userid };

    AppUser.findOne(userQuery, 'uid dates active').then(
      function(queryResult) {
        if( queryResult != null){
          response.json(queryResult);
        } else {
          response.status(404).end();
        }
      },
      function(err) {
        console.log('EHRLOG ' + svr.get('env') + ' [error] - could not complete query in GET /db/v1/user/' + request.params.userid);
        console.log(err);
        response.status(500).json({ message: 'error while searching for user' });
      }
    );
  });

  svr.post('/db/v1/user', function(request, response) {
    var userid = request.body.userid;
    var newUser = new AppUser({
          uid: userid,
          cred: blake.blake2bHex(request.body.knowncred),
          active: true
        }),
        userQuery = { 'uid': userid };

    AppUser.findOne(userQuery, 'uid dates active').then(
      function(queryResult) {
        if( queryResult == null ){
          newUser.save(function(err) {
            if( err != null ){
              console.log('EHRLOG ' + svr.get('env') + ' [error] - could not create new user');
              console.log(err);
              response.status(500).json({ message: 'an error occurred during user creation' });
            }

            console.log('EHRLOG ' + svr.get('env') + ' [info] - created new user: ' + userid);
            response.status(201).end();
          });
        } else {
          response.status(500).json({ message: userid + ' already exists' });
        }
      },
      function(err) {
        console.log('EHRLOG ' + svr.get('env') + ' [error] - could not complete query');
        console.log(err);
        response.status(500).json({ message: 'error while searching for user' });
      }
    );
  });

  svr.get('/session/v1/token', function(request, response) {
    var session = svr.get('session'),
        token = request.headers.token;

    session.get(token, function(err, reply) {
      if( err != null ){
        console.log('EHRLOG ' + svr.get('env') + ' [error] - redis command GET failed for key: ' + token);
        console.log(err);
        response.status(500).json({ message: 'could not get ' + token + ' from cache' });
        return;
      }

      response.json({ sessionReply: JSON.parse(reply) })
    });
  });

  svr.get('/session/v1/tokens', function(request, response) {
    var session = svr.get('session');
        showKeys = !!Object.keys(request.query).length && request.query.detail != undefined

    if( showKeys ){
      session.keys('*', function(err, reply) {
        if( err != null ){
          console.log('EHRLOG ' + svr.get('env') + ' [error] - redis command KEYS failed');
          console.log(err);
          return;
        }

        response.json({ redisContents: reply });
      });
    } else{
      session.dbsize(function(err, reply) {
        if( err != null ){
          console.log('EHRLOG ' + svr.get('env') + ' [error] - redis command DBSIZE failed');
          console.log(err);
          return;
        }

        response.json({ tokenCount: reply });
      });
    }
  });

  /*
   * application version fetch; outputs a git SHA1 hash
   */
  svr.get('/version', function(request, response) {
    //assumes a linux box installation
    childProcess.exec('git rev-list HEAD | head -n1', function(err, stdout, stderr) {
      if( err != null ){
        response.status(500).end()
      }

      response.json({sha: stdout.replace('\n', '')});
    });
  });
}


exports.handleRequests = handler

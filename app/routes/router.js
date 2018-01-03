var blake = require('blakejs'),
    childProcess = require('child_process'),
    facility = require('../api/facility'),
    form = require('../api/form'),
    insurance = require('../api/insurance'),
    kq = require('q'),
    patient = require('../api/patient'),
    uuid = require('uuid');


function handler(svr) {
  //for all api calls related to a specific concept
  facility.api(svr);
  form.api(svr);
  insurance.api(svr);
  patient.api(svr);

  /*
   * POST /v1/auth/user/{some_user_id}
   * begin session for a known user
   */
  svr.post('/v1/auth/user/:userid', function(request, response) {
    //no password presented
    if( request.body.knowncred == undefined ){
      console.log('EHRLOG ' + svr.get('env') + ' [warning] - could not authenticate ' + request.params.userid + ', password not given');
      response.status(401).json({ message: 'your credentials could not be verified' });
      return;
    }

    var userid = request.params.userid,
        passIn = blake.blake2bHex(request.body.knowncred),
        session = svr.get('session');

    //query for specified user
    AppUser.findOne({ 'uid': userid }, 'uid cred').then(
      function(queryResult) {
        //user not found
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

        //update the user's timing information for a login attempt
        AppUser.findByIdAndUpdate(queryResult._id, { $set: { 'dates.lastTry': new Date() } }, function(err) {
          if( err != null ){
            console.log('EHRLOG ' + svr.get('env') + ' [error] - could not update lastTry field for ' + userid);
            console.log(err);
          }
        });

        //success, our user has been accepted and validated
        if( passIn == queryResult.cred ){
          console.log('EHRLOG ' + svr.get('env') + ' [info] - credentials for ' + userid + ' validated, issuing session token');
          //cache session information
          session.set(userToken, JSON.stringify(sessionObject), 'EX', svr.get('sessionTimeout'));
          //update the user's timing information for a successful login
          AppUser.findByIdAndUpdate(queryResult._id, { $set: { 'dates.lastSuccessfulAccess': new Date() } }, function(err) {
            if( err != null ){
              console.log('EHRLOG ' + svr.get('env') + ' [error] - could not update lastSuccessfulAccess field for ' + userid);
              console.log(err);
            }
          });

          //we're done here, return to the client with a session identifier
          response.status(201).json({ token: userToken });
        } else {
          //password invalid
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

  /*
   * POST /v1/auth/user/{some_user_id}/destroy
   * destroy session for a known user
   */
  svr.post('/v1/auth/user/:userid/destroy', function(request, response) {
    var session = svr.get('session'),
        token = request.headers.token,
        userid = request.params.userid;

    //TODO: verify that token and userid are related
    session.del(token, function(err, reply) {
      if( err != null ){
        console.log('EHRLOG ' + svr.get('env') + ' [error] - redis command DEL failed for key: ' + token);
        console.log(err);
        response.status(500).json({ message: 'could not remove ' + token + ' from cache' });
        return;
      }

      //drop the token
      if( reply > 0 ){
        console.log('EHRLOG ' + svr.get('env') + ' [info] - logout; removed ' + userid + '\'s token: ' + token);
        response.end();
      } else{
        //the token could not be found... client application should attempt to authenticate
        console.log('EHRLOG ' + svr.get('env') + ' [debug] - token: ' + token + ', not found... nothing to do');
        response.end();
      }
    });
  });

  /*
   * GET /v1/user
   * retrieves a user session
   */
  svr.get('/v1/user', function(request, response) {
    var session = svr.get('session'),
        token = request.headers.token || '';

    session.get(token, function(err, reply) {
      if( reply != null ){
        //reset the token expiration
        session.expire(token, svr.get('sessionTimeout'));
      }

      response.json({ session: reply });
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
    var detailPayload = {
          redisContents: []
        },
        session = svr.get('session');
        showKeys = !!Object.keys(request.query).length && request.query.detail != undefined,
        simplePayload = {
          tokenCount: 0
        },
        tokenPromises = [];

    if( showKeys ){
      session.keys('*', function(err, reply) {
        //we've got cache keys to examine
        if( reply.length ){
          //walk among the keys and get time-to-live information
          reply.forEach(function(token) {
            var ttlDO = kq.defer();

            //inspect ttl for current token
            session.ttl(token, function(err, reply) {
              ttlDO.resolve({
                cacheId: token,
                ttl: reply + 's'
              })
            });
            tokenPromises.push(ttlDO.promise);
          });

          //wait for all token ttls to have been fetched
          kq.allSettled(tokenPromises).then(function(promiseResults) {
            promiseResults.forEach(function(promiseResult) {
              //assemble tokens and ttls
              detailPayload.redisContents.push(promiseResult.value);
            });
            response.json(detailPayload);
          });
        } else{
          //nothing in the cache, return default detail object
          response.json(detailPayload);
        }
      });
    } else{
      session.dbsize(function(err, reply) {
        simplePayload.tokenCount = reply;
        response.json(simplePayload);
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

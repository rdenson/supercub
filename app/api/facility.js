var kq = require('q');


function FacilityApi(svr) {
  var API_BASE = '/v1/facility',
      auditDocument = svr.get('AuditDocument'),
      facilityDocument = svr.get('FacilityDocument'),
      session = svr.get('session');

  svr.get(API_BASE + '/list', function(request, response) {
    var authDO = kq.defer(),
        token = request.headers.token || '';

    //verify an active session; there are no roles or rights to verify yet
    session.get(token, function(err, reply) {
      if( reply == null ){
        response.status(401).end();
        authDO.reject();
      } else{
        authDO.resolve(JSON.parse(reply));
      }
    });

    //if we're authorized...
    authDO.promise.then(function(currentSession) {
      facilityDocument.list().then(
        function(queryResult) {
          response.json({ listing: queryResult });
        },
        function(queryError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - POST ' + API_BASE + '/list' + ' failed');
          console.log(queryError);
          response.status(500).json();
        }
      );
    });
  });

  svr.post(API_BASE, function(request, response) {
    var authDO = kq.defer(),
        facilityData = {
          active: true,
          address: request.body.address,
          dates: {
            created: new Date(),
            modified: new Date
          },
          city: request.body.city,
          contact: JSON.parse(request.body.contact),
          name: request.body.name,
          notes: request.body.notes,
          state: request.body.state,
          type: request.body.type,
          zipcode: request.body.zipcode
        },
        token = request.headers.token || '';

    //verify an active session; there are no roles or rights to verify yet
    session.get(token, function(err, reply) {
      if( reply == null ){
        response.status(401).end();
        authDO.reject();
      } else{
        authDO.resolve(JSON.parse(reply));
      }
    });

    //if we're authorized...
    authDO.promise.then(function(currentSession) {
      //use the database document to save the facility
      facilityDocument.create(facilityData).then(
        function(id) {
          //write an audit entry when we've saved our new facility, no need to wait for it to return
          auditDocument.addEntry({
            user: currentSession.id,
            action: 'created new facility',
            document: id,
            timestamp: new Date()
          });
          //return the id we just created
          response.status(201).json({ facilityId: id });
        },
        function(saveError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - POST ' + API_BASE + ' failed, ' + saveError.message);
          console.log(facilityData);
          response.status(500).json({ message: saveError.message });
        }
      );
    });
  });
}


exports.api = FacilityApi;

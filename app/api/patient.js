var kq = require('q');


function PatientApi(svr) {
  var API_BASE = '/v1/patient',
      auditDocument = svr.get('AuditDocument'),
      patientDocument = svr.get('PatientDocument'),
      session = svr.get('session');

  svr.delete(API_BASE + '/:patientId', function(request, response) {
    var authDO = kq.defer(),
        patientId = request.params.patientId,
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
      //then "delete" the referenced patient document
      patientDocument.inactivate(patientId).then(
        function() {
          //write an audit entry when we've inactivated the patient, no need to wait for it to return
          auditDocument.addEntry({
            user: currentSession.id,
            action: 'inactivated patient',
            document: patientId,
            timestamp: new Date()
          });
          response.status(204).end();
        },
        function(queryError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - DELETE ' + API_BASE + '/' + request.params.patientId + ' failed');
          console.log(queryError);
          response.status(500).json();
        }
      );
    });
  });

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
      //currently returning up to five patients
      patientDocument.list(5).then(
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
  /*
   * POST /v1/patient
   * creates or save a patient
   */
  svr.post(API_BASE, function(request, response) {
    var authDO = kq.defer(),
        //TODO: needs to come into the POST as part of the payload
        isNew = true,
        //marshal the post body into a patient model
        patientData = {
          active: true,
          demographics: JSON.parse(request.body.demographics),
          generalInfo: JSON.parse(request.body.generalInfo),
          identity: JSON.parse(request.body.identity),
          notes: request.body.notes
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
      //use the database document to save the patient
      patientDocument.save(patientData, isNew).then(
        function(id) {
          //write an audit entry when we've saved our new patient, no need to wait for it to return
          auditDocument.addEntry({
            user: currentSession.id,
            action: 'created new patient',
            document: id,
            timestamp: new Date()
          });
          //return the id we just created
          response.status(201).json({ patientId: id });
        },
        function(saveError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - POST ' + API_BASE + ' failed, ' + saveError.message);
          console.log(patientData);
          response.status(500).json({ message: saveError.message });
        }
      );
    });
  });
}


exports.api = PatientApi;

var kq = require('q');


function InsuranceApi(svr) {
  var API_BASE = '/v1/insurance',
      auditDocument = svr.get('AuditDocument'),
      insuranceDocument = svr.get('InsuranceDocument'),
      session = svr.get('session');

  svr.get(API_BASE + '/:insuranceId', function(request, response) {
    var authDO = kq.defer(),
        insuranceId = request.params.insuranceId,
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
      insuranceDocument.get(insuranceId).then(
        function(queryResult) {
          response.json({ insurance: queryResult });
        },
        function(queryError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - GET ' + API_BASE + '/' + insuranceId + ' failed');
          console.log(queryError);
          response.status(500).json();
        }
      );
    });
  });

  svr.get(API_BASE + '/list/:patientId', function(request, response) {
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
      insuranceDocument.list(patientId).then(
        function(queryResult) {
          response.json({ listing: queryResult });
        },
        function(queryError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - GET ' + API_BASE + '/list failed');
          console.log(queryError);
          response.status(500).json();
        }
      );
    });
  });

  svr.post(API_BASE, function(request, response) {
    var authDO = kq.defer(),
        insuranceData = {
          active: true,
          coverageDate: request.body.coverageDate,
          dates: {
            created: new Date(),
            modified: new Date()
          },
          effectiveDate: request.body.effectiveDate,
          groupNumber: request.body.groupNumber,
          insuranceId: request.body.insuranceId,
          insuranceName: request.body.insuranceName,
          isPrimary: request.body.isPrimary,
          notes: request.body.notes,
          patient: request.body.patient,
          policyHolder: request.body.policyHolder
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
      //use the database document to save the insurance
      insuranceDocument.create(insuranceData).then(
        function(id) {
          //write an audit entry when we've saved our new insurance, no need to wait for it to return
          auditDocument.addEntry({
            user: currentSession.id,
            action: 'created new insurance',
            document: id,
            timestamp: new Date()
          });
          //return the id we just created
          response.status(201).json({ insuranceId: id });
        },
        function(saveError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - POST ' + API_BASE + ' failed, ' + saveError.message);
          console.log(insuranceData);
          response.status(500).json({ message: saveError.message });
        }
      );
    });
  });

  svr.put(API_BASE, function(request, response) {
    var authDO = kq.defer(),
        //marshal the post body into a patient model
        insuranceData = {
          active: true,
          coverageDate: request.body.coverageDate,
          dates: {
            modified: new Date()
          },
          effectiveDate: request.body.effectiveDate,
          groupNumber: request.body.groupNumber,
          insuranceId: request.body.insuranceId,
          insuranceName: request.body.insuranceName,
          isPrimary: request.body.isPrimary,
          notes: request.body.notes,
          patient: request.body.patient,
          policyHolder: request.body.policyHolder
        },
        insuranceId = request.body._id,
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
      insuranceDocument.update(insuranceId, insuranceData).then(
        function(id) {
          //write an audit entry when we've saved our facility, no need to wait for it to return
          auditDocument.addEntry({
            user: currentSession.id,
            action: 'modified insurance',
            document: id,
            timestamp: new Date()
          });
          //return the id we just updated
          response.json({ insuranceId: id });
        },
        function(updateError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - PUT ' + API_BASE + ' failed, ' + updateError.message);
          console.log(insuranceData);
          response.status(500).json({ message: updateError.message });
        }
      );
    });
  });
}


exports.api = InsuranceApi;

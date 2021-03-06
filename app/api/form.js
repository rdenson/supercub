var kq = require('q');


function FormApi(svr) {
  var API_BASE = '/v1/form',
      auditDocument = svr.get('AuditDocument'),
      formDocument = svr.get('FormDocument'),
      session = svr.get('session');

  svr.get(API_BASE + '/:formAbbr/:formId', function(request, response) {
    var authDO = kq.defer(),
        formAbbr = request.params.formAbbr,
        formId = request.params.formId,
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
      formDocument.getForm(formAbbr, formId).then(
        function(queryResult) {
          response.json({ form: queryResult });
        },
        function(queryError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - GET ' + API_BASE + '/' + formAbbr + '/' + formId + ' failed');
          console.log(queryError);
          response.status(500).json();
        }
      );
    });
  });

  svr.get(API_BASE + '/list', function(request, response) {
    var authDO = kq.defer(),
        patientId = request.query.patientId,
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
      formDocument.list(patientId).then(
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
        //marshal the post body into a patient model
        formData = {
          active: true,
          content: JSON.parse(request.body.content),
          dates: {
            created: new Date(),
            modified: new Date()
          },
          name: request.body.name,
          preamble: JSON.parse(request.body.preamble),
          routeName: request.body.routeName,
          suffix: JSON.parse(request.body.suffix)
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
      formDocument.create(formData).then(
        function(id) {
          //write an audit entry when we've saved our new facility, no need to wait for it to return
          auditDocument.addEntry({
            user: currentSession.id,
            action: 'creating a new ' + formData.name + ' form',
            document: id,
            timestamp: new Date()
          });
          //return the id we just created
          response.status(201).json({ formId: id });
        },
        function(createError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - POST ' + API_BASE + ' failed, ' + createError.message);
          console.log(formData);
          response.status(500).json({ message: createError.message });
        }
      );
    });
  });

  svr.put(API_BASE, function(request, response) {
    var authDO = kq.defer(),
        //marshal the post body into a patient model
        formData = {
          active: true,
          content: JSON.parse(request.body.content),
          dates: {
            modified: new Date()
          },
          name: request.body.name,
          preamble: JSON.parse(request.body.preamble),
          routeName: request.body.routeName,
          suffix: JSON.parse(request.body.suffix)
        },
        formId = request.body._id,
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
      formDocument.update(formId, formData).then(
        function(id) {
          //write an audit entry when we've saved our facility, no need to wait for it to return
          auditDocument.addEntry({
            user: currentSession.id,
            action: 'modified form',
            document: id,
            timestamp: new Date()
          });
          //return the id we just updated
          response.json({ formId: id });
        },
        function(updateError) {
          //try to explain the error we received
          console.log('EHRLOG ' + svr.get('env') + ' [error] - PUT ' + API_BASE + ' failed, ' + updateError.message);
          console.log(formData);
          response.status(500).json({ message: updateError.message });
        }
      );
    });
  });
}


exports.api = FormApi;

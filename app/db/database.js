var auditDocument = require('./audit-document'),
    facilityDocument = require('./facility-document');
    formDocument = require('./form-document');
    patientDocument = require('./patient-document');


//setup mongo documents
//singleton modules passed the mongoose object
//
//    mongoose ubiquitous language
//      - schema: definition (ddl)
//      - model: compiled schema object (named)
//      - document: model instance
//
//patient document [::] example
//  input mongoose object (consoServer.get('database'))
//  setup schema
//  returns actions, wrapper functions for data access
function handler(svr) {
  auditDocument(svr);
  facilityDocument(svr);
  formDocument(svr);
  patientDocument(svr);
}


exports.handleDocuments = handler

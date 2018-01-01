var extend = require('extend'),
    kq = require('q');


/*
  CURRENT
  form resource (frontend:generic) | form api (backend entrypoint:generic) >> form-document (database:generic)
  form - generic container for application documents
    preamble: generic form section
    content: form data
    suffix: generic form section

  NEW?
  form resource (generic) | form api (generic) >> [formspec0, formspec1, formspec2] (database:specific)

  NOTES
  schemas can live in a separate module but, these case statements... this needs work
*/

function FormDocument(serverObject) {
  var db = serverObject.get('database'),
      //maybe I can move these schemas to a separate module...
      mapSchema = db.Schema({
        active: Boolean,
        content: {
          planItems: [{
            concern: String,
            result: String,
            steps: String
          }]
        },
        dates: {
          created: Date,
          modified: Date
        },
        name: String,
        preamble: {
          facilityName: String,
          patient: db.Schema.Types.ObjectId,
          patientName: String,
          patientSsn: String,
          visitDate: String
        },
        routeName: String,
        suffix: {
          pharmacistName: String,
          signatureDate: String,
          timeSpent: String
        }
      });
      soapSchema = db.Schema({
        active: Boolean,
        content: {
          assessment: String,
          objective: String,
          plan: String,
          subjective: String
        },
        dates: {
          created: Date,
          modified: Date
        },
        name: String,
        preamble: {
          facilityName: String,
          patient: db.Schema.Types.ObjectId,
          patientName: String,
          patientSsn: String,
          visitDate: String
        },
        routeName: String,
        suffix: {
          pharmacistName: String,
          signatureDate: String,
          timeSpent: String
        }
      });
  //var formModel = db.model('Form', formSchema);
  //we'll need a model per form?
  var mapModel = db.model('MapForm', mapSchema),
      soapModel = db.model('SoapForm', soapSchema);

  var documentFunctions = {
        create: function(modelObject) {
          var createDO = kq.defer(),
              document = null;

          //determine which schema to use via modelObject.routeName
          switch (modelObject.routeName) {
            case 'map':
              document = new mapModel(modelObject);
              break;

            case 'soap':
              document = new soapModel(modelObject);
              break;
          }

          document.save(function(err, savedDoc) {
            if( err != null ){
              createDO.reject({
                message: 'form [' + modelObject.name + '] could not be created',
                rawError: err
              });
            }

            createDO.resolve(savedDoc._id);
          });

          return createDO.promise;
        },
        getForm: function(formAbbr, formId) {
          var formDO = kq.defer();

          switch (formAbbr) {
            case 'map':
              return mapModel.findOne({ _id: formId });
              break;

            case 'soap':
              return soapModel.findOne({ _id: formId });
              break;

            default:
              formDO.reject('could not find form using:\nabbreviation - ' + formAbbr + '\nid - ' + formId);
              return formDO.promise;
          }
        },
        list: function(patientId) {
          var allForms = [],
              formPromises = [],
              listDO = kq.defer();

          formPromises.push(
            mapModel
              .find({ 'preamble.patient': patientId }, 'dates.modified name routeName preamble.patient preamble.visitDate')
              .where('active')
              .equals(true)
              .sort({ 'preamble.visitDate': 1 })
          );
          formPromises.push(
            soapModel
              .find({ 'preamble.patient': patientId }, 'dates.modified name routeName preamble.patient preamble.visitDate')
              .where('active')
              .equals(true)
              .sort({ 'preamble.visitDate': 1 })
          );

          kq.allSettled(formPromises).then(function(promiseResults) {
            promiseResults.forEach(function(promiseResult) {
              if( promiseResult.value.length ){
                allForms = allForms.concat(promiseResult.value);
              }
            });

            listDO.resolve(allForms);
          });

          return listDO.promise;
        },
        update: function(id, modelObject) {
          var documentDO = kq.defer(),
              updateDO = kq.defer();

          //this looks ugly... needs work
          switch (modelObject.routeName) {
            case 'map':
              mapModel.findById(id, function(err, doc) {
                var existingDoc = extend(true, doc, modelObject);
                var document = new mapModel(existingDoc);

                documentDO.resolve(document);
              });
              break;

            case 'soap':
              soapModel.findById(id, function(err, doc) {
                var existingDoc = extend(true, doc, modelObject);
                var document = new soapModel(existingDoc);

                documentDO.resolve(document);
              });
              break;
          }

          documentDO.promise.then(function(d) {
            d.save(function(err, savedDoc) {
              if( err != null ){
                updateDO.reject({
                  message: 'form [' + modelObject.name + '] could not be saved',
                  rawError: err
                });
              }

              updateDO.resolve(savedDoc._id);
            });
          });

          return updateDO.promise;
        }
      };

  //move to set on a callback?
  serverObject.set('FormDocument', documentFunctions);
}


module.exports = FormDocument;

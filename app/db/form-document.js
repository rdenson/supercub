var extend = require('extend'),
    kq = require('q');


function FormDocument(serverObject) {
  var db = serverObject.get('database'),
      formSchema = db.Schema({
        active: Boolean,
        assessment: String,
        dates: {
          created: Date,
          modified: Date
        },
        name: String,
        objective: String,
        plan: String,
        preamble: {
          facilityName: String,
          patient: db.Schema.Types.ObjectId,
          patientName: String,
          patientSsn: String,
          visitDate: String
        },
        routeName: String,
        subjective: String,
        suffix: {
          pharmacistName: String,
          signatureDate: String,
          timeSpent: String
        }
      });
  var formModel = db.model('Form', formSchema);

  var documentFunctions = {
        create: function(modelObject) {
          var document = new formModel(modelObject),
              createDO = kq.defer();

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
        getForm: function(formId) {
          return formModel.findOne({ _id: formId });
        },
        list: function() {
          return formModel
            .find({}, 'dates.modified name routeName preamble.patient preamble.visitDate')
            .where('active')
            .equals(true)
            .sort({ 'preamble.visitDate': 1 });
        },
        update: function(id, modelObject) {
          var updateDO = kq.defer();

          formModel.findById(id, function(err, doc) {
            var existingDoc = extend(true, doc, modelObject);
            var document = new formModel(existingDoc);

            document.save(function(err, savedDoc) {
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

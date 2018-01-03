var extend = require('extend'),
    kq = require('q');


function InsuranceDocument(serverObject) {
  var db = serverObject.get('database'),
      insuranceSchema = db.Schema({
        active: Boolean,
        coverageDate: String,
        dates: {
          created: Date,
          modified: Date
        },
        effectiveDate: String,
        groupNumber: String,
        insuranceId: String,
        insuranceName: String,
        isPrimary: Boolean,
        notes: String,
        patient: db.Schema.Types.ObjectId,
        policyHolder: String
      });
  var insuranceModel = db.model('Insurance', insuranceSchema);

  var documentFunctions = {
        create: function(modelObject) {
          var document = new insuranceModel(modelObject),
              createDO = kq.defer();

          document.save(function(err, savedDoc) {
            if( err != null ){
              createDO.reject({
                message: 'insurance could not be created',
                rawError: err
              });
            }

            createDO.resolve(savedDoc._id);
          });

          return createDO.promise;
        },
        get: function(insuranceId) {
          return insuranceModel.findOne({ _id: insuranceId });
        },
        list: function(patientId) {
          return insuranceModel.find({ patient: patientId }, 'active insuranceName isPrimary dates.modified').where('active').equals(true);
        },
        update: function(id, modelObject) {
          var updateDO = kq.defer();

          insuranceModel.findById(id, function(err, doc) {
            var existingDoc = extend(true, doc, modelObject);
            var document = new insuranceModel(existingDoc);

            document.save(function(err, savedDoc) {
              if( err != null ){
                updateDO.reject({
                  message: 'insurance (' + id + ') could not be saved',
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
  serverObject.set('InsuranceDocument', documentFunctions);
}


module.exports = InsuranceDocument;

var kq = require('q');


function PatientDocument(serverObject) {
  var db = serverObject.get('database'),
      patientSchema = db.Schema({
        active: Boolean,
        dates: {
          created: Date,
          modified: Date
        },
        demographics: {
          drugAllergies: [String],
          gender: String,
          heightFeet: Number,
          heightInches: Number,
          language: String,
          lastHospitalized: String,
          physicianName: String,
          physicianPhone: String,
          physicianFax: String,
          race: String,
          weightLbs: Number
        },
        generalInfo: {
          address: String,
          city: String,
          firstname: String,
          lastname: String,
          middlename: String,
          state: String,
          zipcode: String
        },
        identity: {
          dateOfBirth: String,
          mrn: String,
          ssn: String
        },
        notes: String
      });
  var patientModel = db.model('Patient', patientSchema);

  //function set (object) exposed for public interaction with the Patient document
  var documentFunctions = {
    /*
     * save api
     * maybe this should be two functions...
     *  create
     *  update
     */
    save: function(modelObject, isNewPatient) {
      var checkExistingQuery = {
            'identity.ssn': modelObject.identity.ssn
          },
          saveDO = kq.defer();

      if( isNewPatient ){
        patientModel.findOne(checkExistingQuery, '_id generalInfo.firstname generalInfo.middlename generalInfo.lastname identity.mrn').then(
          function(queryResult) {
            if( queryResult != null ){
              saveDO.reject({
                message: 'a patient with that social security number already exists',
                queryReply: queryResult
              });
            } else{
              //this needs to happen before we reach here...
              modelObject.dates = {
                created: new Date(),
                modified: new Date()
              };

              var document = new patientModel(modelObject);
              document.save(function(err, savedDoc) {
                saveDO.resolve(savedDoc._id);
              });
            }
          },
          function(err) {
            saveDO.reject({
              message: 'existence check query failed',
              rawError: err
            });
          }
        );
      }

      return saveDO.promise;
    }
  };

  //move to set on a callback?
  serverObject.set('PatientDocument', documentFunctions);
}


module.exports = PatientDocument;

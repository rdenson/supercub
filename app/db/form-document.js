var kq = require('q');


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
        list: function() {
          return formModel.find({}, 'dates.modified name routeName preamble.patient').where('active').equals(true);
        }
      };

  //move to set on a callback?
  serverObject.set('FormDocument', documentFunctions);
}


module.exports = FormDocument;

var kq = require('q');


function FacilityDocument(serverObject) {
  var db = serverObject.get('database'),
      facilitySchema = db.Schema({
        active: Boolean,
        address: String,
        dates: {
          created: Date,
          modified: Date
        },
        city: String,
        contact: {
          fax: String,
          person: {
            extension: String,
            name: String,
            phone: String
          },
          phone: String
        },
        name: String,
        notes: String,
        state: String,
        type: String,
        zipcode: String
      });
  var facilityModel = db.model('Facility', facilitySchema);

  var documentFunctions = {
        create: function(modelObject) {
          var document = new facilityModel(modelObject),
              createDO = kq.defer();

          document.save(function(err, savedDoc) {
            if( err != null ){
              createDO.reject({
                message: 'facility could not be created',
                rawError: err
              });
            }

            createDO.resolve(savedDoc._id);
          });

          return createDO.promise;
        },
        list: function() {
          return facilityModel.find({}, 'address city name state type zipcode');
        }
      };

  //move to set on a callback?
  serverObject.set('FacilityDocument', documentFunctions);
}


module.exports = FacilityDocument;

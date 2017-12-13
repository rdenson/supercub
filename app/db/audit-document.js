function AuditDocument(serverObject) {
  var db = serverObject.get('database'),
      //who did what when
      auditSchema = db.Schema({
        //reference to appusers collection
        user: db.Schema.Types.ObjectId,
        action: String,
        //reference to generic document the user may have operated on
        document: db.Schema.Types.ObjectId,
        timestamp: Date
      });
  var auditModel = db.model('Audit', auditSchema);

  var documentFunctions = {
        addEntry: function(modelObject) {
          var document = new auditModel(modelObject);

          document.save(function(err) {
            //TODO: report error
          });
        }
      };

  //move to set on a callback?
  serverObject.set('AuditDocument', documentFunctions);
}


module.exports = AuditDocument;

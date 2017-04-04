'use strict';

module.exports = function(Record) {
  //Record.beforeRemote('create', function(context, user, next) {
    //context.args.data.created = Date.now();
    //context.args.data.updated = context.args.data.created;
    //next();
  //});
  Record.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
      ctx.instance.updated = ctx.instance.created;
    } else {
      ctx.data.updated = new Date();
    }
    next();
  });

  Record.remoteMethod ('upload', {
    "description": "Uploads files for a Record",
    accepts: [
      { arg: "id", type: "string", required: true},
      { arg: 'context', type: "object", http: {source:"context"} },
      { arg: 'options', type: "object", http: {source:"query"} }
    ],
    returns: {
      arg: "MediaFile", type: "object", root: true
    },
    http: {path: '/:id/upload',verb: "post"}
  });

  Record.upload = function (id, context, options, cb) {
    Record.exists(id, function (err, exists) {
      if (!err && exists) {
        var MediaFile = Record.app.models.MediaFile;
        MediaFile.upload(context, {recordId: id}, function (errFile, resFile) {
          if (!errFile) {
            cb(null, resFile);
          } else {
            cb(errFile);
          }
        });
      } else {
        cb(err);
      }
    })
  };



  Record.remoteMethod ('findLastNotPublished', {
    "description": "find last not published record or creates a new one",
    accepts: [
    { arg: 'context', type: 'object', http: {source:"context"}},
    { arg: 'options', type: 'object', http: { source: 'query' }}
    ],
    returns: {
      arg: 'Record', type: 'object', root: true
    },
    http: { path: '/findLastNotPublished', verb: 'get' }
  });
  Record.findLastNotPublished = function (context, options, cb) {
    Record.findOne({order: 'updated DESC', where: {'published': false, 'explorerId': context.req.accessToken.userId}, 'include': 'media'}, function (err, rec) {
      if (!err) {
        console.log("Record: " + rec);
        if (rec != null) {
          cb(null, rec);
        } else {
          console.log("Creando nuevo record");
          Record.create({
            "explorerId": context.req.accessToken.userId
          }, function(errR, rec) {
            if (!errR) {
              cb(null, rec);
            } else {
              console.log(errR);
              cb(errR);
            }
          });
        }
      } else {
        console.log(err);
        cb(err)
      }
    });
  };
  
  Record.remoteMethod ('findPublishedRecords', {
    "description": "find all published records",
    accepts: [
    { arg: 'context', type: 'object', http: {source:"context"}},
    { arg: 'options', type: 'object', http: { source: 'query' }}
    ],
    returns: {
      arg: 'Record[]', type: 'object', root: true
    },
    http: { path: '/findPublishedRecords', verb: 'get' }
  });
  Record.findPublishedRecords = function (context, options, cb) {
    Record.find({order: 'updated DESC', where: {'published': true }, 'include': ['media', 'explorer']}, function (err, rec) {
      if (!err) {
        console.log("Record: " + rec);
        if (rec != null) {
          cb(null, rec);
        } else {
          cb(null, []);
        }
      } else {
        console.log(err);
        cb(err)
      }
    });
  };
};

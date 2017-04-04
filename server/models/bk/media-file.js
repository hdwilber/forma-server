'use strict';

var fs = require("fs");
var CONTAINERS_PREFIX = "F";
var LOCAL_STORAGE_ROOT = "./storage";

var Magic = require('mmmagic').Magic;
var CONTAINERS_PREFIX = "F";
var gm = require('gm').subClass({imageMagick: true});
var ExifImage = require('exif').ExifImage;
var geolib = require("geolib");
var async = require ("async");
var loopback = require('loopback');

module.exports = function(MediaFile) {
  MediaFile.beforeRemote('create', function (context, user, next) {
    context.args.data.created = Date.now();
    context.args.data.updated = context.args.data.created;
    next();
  });

  MediaFile.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
      ctx.instance.updated = ctx.instance.created;
    } else {
      ctx.data.updated = new Date();
    }
    next();
  });

  function _readAsync(data, cb) {
    let aux = data.file;
    let tar = Date.now() + aux.name;
    //console.log ("Change from: " +data.containerPath + "/"+aux.name+ ", to: "+ data.containerPath + "/" +tar);
    fs.rename( LOCAL_STORAGE_ROOT + "/" + data.containerPath + "/"+aux.name, LOCAL_STORAGE_ROOT + "/" + data.containerPath + "/" + tar, function (errr) {
      if (!errr) {
        console.log ("Renaming Done");
        //console.log (data);
        gm(LOCAL_STORAGE_ROOT + "/"+data.containerPath + "/" + tar).format(function (errgm, format) {
          if (!errgm) {
            new ExifImage ( { image: LOCAL_STORAGE_ROOT + "/"+ data.containerPath +"/"+tar }, function (errExif, exifData) {
              if (!errExif) {
                let gps = exifData.gps;
                let lat, lng;
                if (gps!= undefined){
                  if (gps.GPSLatitude != undefined || gps.GPSLongitude != undefined) {
                    let auxlat = ""+gps.GPSLatitude[0]+"°" + gps.GPSLatitude[1] + "'"+ gps.GPSLatitude[2] + "\"" + gps.GPSLatitudeRef;
                    let auxlng = ""+gps.GPSLongitude[0]+ "°" + gps.GPSLongitude[1]+"'"+ gps.GPSLongitude[2] + "\"" + gps.GPSLongitudeRef;
                    lat = geolib.sexagesimal2decimal(auxlat);
                    lng = geolib.sexagesimal2decimal(auxlng);
                    //console.log("Lat: "+ lat, "Lng: " + lng);
                  }
                } else {
                  console.log ("no tiene GPS info")
                }
                MediaFile.create( {
                  name: aux.name,
                  type: aux.type,
                  format: format,
                  recordId: data.recordId, 
                  authorId: data.userId,
                  container: aux.container,
                  targetName: tar,
                  location: new loopback.GeoPoint({ 
                    lat: (lat != undefined) ? lat: 0,
                    lng: (lng != undefined) ? lng: 0
                  }),
                  path: data.containerPath + "/" + tar,
                  url: "/Containers/"+aux.container+"/download/" + tar,
                  }, function (errFi, obj) {
                    if (!errFi) {
                      cb(null, obj);
                    } else {
                      cb(errFi);
                    }
                });
              } else {
                console.log("Exif data failed");
                MediaFile.create( {
                  name: aux.name,
                  type: aux.type,
                  format: format,
                  recordId: data.recordId, 
                  authorId: data.userId,
                  container: aux.container,
                  targetName: tar,
                  //locationlat: 0,
                  //lng: 0,
                  path: data.containerPath + "/" + tar,
                  url: "/Containers/"+aux.container+"/download/" + tar,
                  }, function (errFi, obj) {
                    if (!errFi) {
                      cb(null, obj);
                    } else {
                      cb(errFi);
                    }
                });
              }
            });
          } else {
            cb(errgm);
          }
        });
      } else {
        console.log("Somehing went wrong");
        cb(errr);
      }
    });
  }


  function _doUpload(context, options, cb) {
    var Container = MediaFile.app.models.Container;
    console.log("Trying to upload");
    Container.upload (context.req, context.res, function (err, mediaFiles) {
      console.log("Hola mundo --- ");
      if (!err) {
        console.log("DO UPLOAD STARTING");
        var uploadFiles = [];
        
        console.log(mediaFiles.files.upload);
        mediaFiles.files.upload.forEach(function(f){
          uploadFiles.push({
            containerPath: options.containerPath,
            file: f,
            recordId: options.recordId,
            userId: ""+context.req.accessToken.userId
          });

        });

        console.log("Hola mundo");
        async.map (uploadFiles, _readAsync, function (err, res) {
          cb(null, res);
        });

      } else {
        console.log("DO UPLOAD FAILED");
        cb(null, {});
      }
    });
  };

  MediaFile.upload = function (ctx, options, cb) {
    var Container = MediaFile.app.models.Container;
    var containerPath = CONTAINERS_PREFIX + ctx.req.accessToken.userId;
    ctx.req.params.container = containerPath;
    options.containerPath = containerPath;
    console.log("DEbug 1");
    Container.getContainer (containerPath, function (err, res) {
      console.log("DEbug 2");
      if (!err) {
        console.log ("Container exists");
        _doUpload (ctx, options, function (errf, files){
          if (!errf) {
            cb(null, files);
          } else {
            //console.log ("Error uploading");
            cb(err, {});
          }
        });
      } else {
        //console.log ("Container doesnt exists");
        Container.createContainer ({ "name": containerPath}, function (errCreate, container) {

          if (!errCreate) {
            //console.log ("Nuevo container: "+ container);
            _doUpload (ctx, options, function (errf, files){
              if (!errf) {
                cb(null, files);
              } else {
                //console.log ("Error uploading");
                cb(errf);
              }
            });
          } else {
            cb(errCreate);
            //console.log ("Error al create container : "+ err);
          }
        });
      }
    });
  };

  MediaFile.remoteMethod("url", {
    "description": "Get URL for a mediafile",
    accepts: [
      { arg: 'context', type: 'object', http: { source:'context' } },
      { arg: 'filename', type: 'object', http:{ source: 'query'} }
    ],
    returns: {
      arg: "url", type: "string", root: true
    },
    http: {verb: "get"}

  });


  MediaFile.download = function (id,context, cb) {
    MediaFile.findOne({where: {id: id}}, function (err, res) {
      var Container = MediaFile.app.models.Container;
      //console.log(res);
      if (!err) {
        cb(null, {download: "/Containers/"+ res.container+"/download/"+res.targetName});
      } else {
        cb(null, {download: ""});
      }
    }); 
  }

};

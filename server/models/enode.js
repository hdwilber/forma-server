'use strict';

module.exports = function(Enode) {
  Enode.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
      ctx.instance.updated = ctx.instance.created;
    } else {
      ctx.instance.updated = new Date();
    }
    next();
  });

  //Enode.prepend = function (id, enode, cb) {
    //Enode.findById(id, {include: ['prev', 'next']}, function (err, ori) {
      //if (!err) {
        //var pr = null;
        //var ne = null;

        //if( ori.prev == null ) {
          //ori.save({prevId: enode.id}, function (err, o2) {
            //cb(null, o2);
          //});
        //} else {
          //ori.prev.save({nextId: enode.id}, function (err, ori2) {
            //enode.save({prevId: ori.prev.id, nextId: ori.next.id}, function (err, enode2) {
              //cb(null, ori2);
            //});
          //});
        //}
      //} else {
        //cb(err);
      //}
    //})
  //};
 

  Enode.prototype.appendIn = function (e, cb) {
    if (e.first == null) {
      e.parentId = this.id;
      this.firstId = e.id;
      this.lastId = e.id;
      this.save({}, function (err, _this) {
        if (!err) {
          e.save({}, function (err2, e2) {
            cb (null, e2);
          });
        } else {
          cb (null);
        }
      });
    } else {
      this.lastId = e.id;
      var _this = this;
      Enode.findById(this.lastId, function (err, last) {
        if (!err) {
          last.append(e,function (err2, ne ) {
            if (!err2) {
              _this.lastId = ne.id;
              _this.save({}, function (err3, _this) {
                if (!err3) {
                  cb (null, ne);
                }
              });
            } else {
              cb (err2)
            }
          });
        } else {
          cb (err);
        }
      });
    }
  };

  Enode.prototype.append = function (tar, cb) {
    if( this.nextId == null ) {
      this.nextId = tar.id;
      this.save({}, function (err, ori2) {
        tar.prevId = ori2.id;
        // Needs to save the new Enode;
        cb(null, tar);
      });
    } else {
      Enode.findById(this.nextId, function (err, next) {
        if (!err) {
          next.prevId = tar.id;
          this.nextId = tar.id;
          this.save({}, function (err2, ori2) {
            if (!err2) {
              next.save({}, function (err3, next2) {
                if (!err3) {
                  tar.prevId = ori2.id;
                  tar.nextId = next.id;
                  cb(null, tar);
                } 
              });
            }
          });
        }
      });
    }
  };

  Enode.append = function (ori, tar, cb) {
    if( ori.nextId == null ) {
      ori.nextId = tar.id;
      ori.save({}, function (err, ori2) {
        tar.prevId = ori.id;
        // Needs to save the new Enode;
        cb(null, tar );
      });
    } else {
      Enode.findById(ori.nextId, function (err, next) {
        if (!err) {
          next.prevId = tar.id;
          next.save({}, function (err2, next2) {
            if (!err2) {
              ori.nextId = tar.id;
              ori.save({}, function (err3, ori2) {
                if (!err3) {
                  tar.prevId = ori.id;
                  tar.nextId = next.id;
                  cb(null, tar);
                } 
              });
            }
          });
        }
      });
    }
  };

  Enode.prototype.prepend = function (tar, cb) {
    if( this.prevId == null ) {
      this.prevId = tar.id;
      this.save({}, function (err, ori2) {
        tar.nextId = ori2.id;
        cb(null, tar );
      });
    } else {
      var _this = this;
      Enode.findById(this.prevId, function (err, prev) {
        if (!err) {
          prev.nextId = tar.id;
          _this.prevId = tar.id;
          _this.save({}, function (err2, ori2) {
            if (!err2) {
              prev.save({}, function (err, prev2) {
                if (!err2) {
                  tar.prevId = prev.id;
                  tar.nextId = ori2.id;
                  cb(null, tar);
                }
              });
            }
          });
        }
      });
    }
  }

  Enode.prepend = function (ori, tar, cb) {
    if( ori.prevId == null ) {
      ori.prevId = tar.id;
      ori.save({}, function (err, ori2) {
        tar.nextId = ori.id;
        cb(null, tar );
      });
    } else {
      Enode.findById(ori.prevId, function (err, prev) {
        if (!err) {
          prev.nextId = tar.id;
          ori.prevId = tar.id;
          ori.save({}, function (err2, ori2) {
            if (!err2) {
              prev.save({}, function (err, prev2) {
                if (!err2) {
                  tar.prevId = prev.id;
                  tar.nextId = ori.id;
                  cb(null, tar);
                }
              });
            }
          });
        }
      });
    }
  };
  

  Enode.setBefore = function (id, context, enode, cb) {
    Enode.findById(id, function (err, enode) {
      if (!err) {
        Enode.findById(enode, function (err2, eto) {
          if (!err2) {
            eto.prepend(enode, function (err3, ne) {
              if (!err3) {
                ne.save({}, function (err4 , ok) {
                  if (!err4) {
                    cb(null, ok);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Enode.remoteMethod('setBefore', {
    description: 'Stores a new Enode and puts before of the Enode Id',
    accepts: [
        { arg: 'id', type: 'string', required: true },
        { arg: 'context', type: 'object', http: {source: 'context'} },
        { arg: 'enode', type: 'string', required: true },
      ],
    returns: { 
      arg: 'Enode', type: 'object', root: true
    },
    http: {path: '/:id/prepend/:enode', verb: 'get'}
  });

  function retrieveAndPush(a, enode, cb) {
    if (enode.nextId != null) {
      Enode.findById(enode.nextId, function (err, next) {
        if (!err) {
          a.push(next);
          retrieveAndPush(a, next, cb);
        } else {
          console.log("Error retrievign");
        }
      });
    } else {
      cb(null);
    }
  }

  Enode.listFrom = function (id, context, next) {
    Enode.findById(id, function (err, enode) {
      if (!err) {
        enode.sayHello();
        var ret = [enode];
        retrieveAndPush(ret, enode, function(err2) {
          if (!err2) {
            console.log(ret);
            next(null, ret);
          } else {
            next();
          }
        });
      } else {
        next();
      }
    });
  }
  Enode.remoteMethod('listFrom', {
    description: 'List Enodes starting from selected Enode',
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'context', type: 'object', http: {source: 'context'} }
    ],
    returns: { 
      arg: 'Enode[]', type: 'array', root: true
    },
    http: {path: '/:id/list', verb: 'get'}
  });

  //Enode.remoteMethod('prepend', {
    //description: 'Stores a new Enode and puts before of the Enode Id',
    //accepts: [
      //{ arg: 'id', type: 'string', required: true },
      //{ arg: 'context', type: 'object', http: {source: 'context'} },
      //{ arg: 'options', type: 'object', http: {source: 'body'} },
      //],
    //returns: { 
      //arg: 'Enode', type: 'object', root: true
    //},
    //http: {path: '/:id/prepend', verb: 'post'}
  //});
  //Enode.remoteMethod('append', {
    //description: 'Stores a new Enode and puts after of the Enode Id',
    //accepts: [
      //{ arg: 'id', type: 'string', required: true },
      //{ arg: 'context', type: 'object', http: {source: 'context'} },
      //{ arg: 'options', type: 'object', http: {source: 'query'} },
      //],
    //returns: { 
      //arg: 'Enode', type: 'object', root: true
    //},
    //http: {path: '/:id/append', verb: 'post'}
  //});
};

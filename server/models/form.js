'use strict';

module.exports = function(Form) {
  Form.observe('before save', function (ctx, next) {
    console.log(ctx.instance);
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
      ctx.instance.updated = ctx.instance.created;
    } else {
      ctx.data.updated = new Date();
    }
    next();
  });

  Form.prototype.appendIn = function (e, cb) {
    if (e.firstId == null) {
      e.firstId = this.id;
      e.lastId = this.id;
      e.save({}, function (err, e2) {
        if (!err) {
          cb ();
        } else {
          cb(err);
        }
      });
    } else {
      var _this = this;
      Form.findById(e.lastId, function (err, last) {
        if (!err) {
          last.append(_this,function (err2, _this) {
            if (!err2) {
              e.lastId = _this.id;
              e.save({}, function (err3, ne2) {
                if (!err3) {
                  cb (null, _this);
                } else {
                  cb(err3);
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

  Form.prototype.append = function (tar, cb) {
    if( this.nextId == null ) {
      this.nextId = tar.id;
      this.save({}, function (err, ori2) {
        tar.prevId = ori2.id;
        tar.save({}, function (err2, nt) {
          cb(null, tar);
        })
      });
    } else {
      Form.findById(this.nextId, function (err, next) {
        if (!err) {
          next.nextId = tar.id;
          next.save({}, function (err2, next2) {
            if (!err2) {
              tar.prevId = next.id;
              tar.save({}, function (err3, nt) {
                cb();
              });
            } else { cb(err2);}
          });
        }
      });
    }
  };

  Form.afterRemote('create', function (ctx,form, next) {
    console.log(form);
    next();
    //if (form.parentId) {
      //Form.findById(form.parentId, function (err, p) {
        //if (!err) {
          //form.appendIn(p, function (err2, aux) {
            //if (!err2) {
              //next();
            //}
          //});
        //}
      //});
    //} else {
      //next();
    //}
  });

  function retrieveAndPush(a, form, cb) {
    if (form.nextId != null) {
      Form.findById(form.nextId, function (err, next) {
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
  Form.listFrom = function (id, context, next) {
    Form.findById(id, function (err, form) {
      if (!err) {
        var ret = [form];
        retrieveAndPush(ret, form, function(err2) {
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
  };
  Form.prototype.listChildren = function (cb) {
    if (this.firstId) {
      Form.findById(this.firstId, function (err, first) {
        if (!err) {
          var ret = [first];
          retrieveAndPush(ret, first, function(err2) {
            if (!err2) {
              cb(null, ret);
            } else {
              cb();
            }
          });
        } else {
          cb();
        }
      });
    }
  };

  Form.listChildren = function (id, context, next) {
    Form.findById(id, function (err, form) {
      if (!err) {
        form.listChildren(function (err, children) {
          next(null, children);
        });
      } else {
        next();
      }
    });
  };
  Form.remoteMethod('listFrom', {
    description: 'List Forms starting from selected form',
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'context', type: 'object', http: {source: 'context'} }
    ],
    returns: { 
      arg: 'Form[]', type: 'array', root: true
    },
    http: {path: '/:id/listFrom', verb: 'get'}
  });

  Form.remoteMethod('listChildren', {
    description: 'List Forms in form',
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'context', type: 'object', http: {source: 'context'} }
    ],
    returns: { 
      arg: 'Form[]', type: 'array', root: true
    },
    http: {path: '/:id/children', verb: 'get'}
  });
};

'use strict';

module.exports = function(Widget) {

  Widget.CONTAINER_TYPES = [
  {
    code: 'panel',
    name: 'Panel'
  }
  ];
  Widget.INPUT_TYPES = [{
    code: 'input',
    name: 'Input',
    subTypes: [
      {code: 'numeric', name: 'Numeric'},
      {code: 'text', name: 'Text'},
      {code: 'date', name: 'Date'},
    ]
  },
  {
    code: 'selection',
    name: 'Selection',
    subTypes: [
      {
        code: 'simple', name: 'Simple'
      },
      {  code: 'level', name: 'Level'}
    ]
  }
  ];


  Widget.listTypes = function (next) {
    next(null, {containers: Widget.CONTAINER_TYPES, input: Widget.INPUT_TYPES});
  };

  Widget.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
      ctx.instance.updated = ctx.instance.created;
    } else {
      ctx.data.updated = new Date();
    }
    next();
  });

  Widget.prototype.appendIn = function (e, cb) {
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
      Widget.findById(e.lastId, function (err, last) {
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


  Widget.prototype.append = function (tar, cb) {
    if( this.nextId == null ) {
      this.nextId = tar.id;
      this.save({}, function (err, ori2) {
        tar.prevId = ori2.id;
        tar.save({}, function (err2, nt) {
          cb(null, tar);
        })
      });
    } else {
      Widget.findById(this.nextId, function (err, next) {
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

  Widget.afterRemote('create', function (ctx,widget, next) {
    if (widget.parentId) {
      Widget.findById(widget.parentId, function (err, p) {
        if (!err) {
          widget.appendIn(p, function (err2, aux) {
            if (!err2) {
              next();
            }
          });
        }
      });
    } else {
      next();
    }
  });

  function retrieveAndPush(a, widget, cb) {
    if (widget.nextId != null) {
      Widget.findById(widget.nextId, function (err, next) {
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
  Widget.listFrom = function (id, context, next) {
    Widget.findById(id, function (err, widget) {
      if (!err) {
        var ret = [widget];
        retrieveAndPush(ret, widget, function(err2) {
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
  Widget.prototype.listChildren = function (cb) {
    if (this.firstId) {
      Widget.findById(this.firstId, function (err, first) {
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

  Widget.listChildren = function (id, recursive, context, next) {
    console.log(recursive);
    Widget.findById(id, function (err, widget) {
      if (!err) {
        widget.listChildren(function (err, children) {
          next(null, children);
        });
      } else {
        next();
      }
    });
  };
  Widget.remoteMethod('listFrom', {
    description: 'List Widgets starting from selected Widget',
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'context', type: 'object', http: {source: 'context'} }
    ],
    returns: { 
      arg: 'Widget[]', type: 'array', root: true
    },
    http: {path: '/:id/listFrom', verb: 'get'}
  });

  Widget.remoteMethod('listChildren', {
    description: 'List Widgets in Widget',
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'recursive', type: 'object', http: { source: 'query' } },
      { arg: 'context', type: 'object', http: {source: 'context'} }
    ],
    returns: { 
      arg: 'Widget[]', type: 'array', root: true
    },
    http: {path: '/:id/children', verb: 'get'}
  });
  Widget.remoteMethod('listTypes', {
    description: 'List of Widgets types and subtypes',
    accepts: [
    ],
    returns: {
      arg: 'WidgetTypes[]', type: 'array', root: true
    },
    http: { path: '/types', verb: 'get' }
  });
};

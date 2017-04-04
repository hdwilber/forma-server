'use strict';

module.exports = function(InputWidget) {
  InputWidget.observe('before save', function (ctx, next) {
    var Enode = InputWidget.app.models.Enode;
    if (ctx.isNewInstance) {
    } else {
    }
    next();
  });

  InputWidget.observe('after save', function (ctx, next) {
    var Enode = InputWidget.app.models.Enode;
    if (ctx.isNewInstance) {
      Enode.create({
        'enodeableId': ctx.instance.id,
        'enodeableType': InputWidget.definition.name
      }, function (err, e){
        if (!err) {
          console.log("NO hubo error");
          next();
        } else {
          console.log("Vamos bien no mas");
          console.log(err);
          next();
        }
      });
    } else {
      next();
    }
  });
  InputWidget.afterRemote('create', function (ctx,widget, next) {
    var Enode = InputWidget.app.models.Enode;
    Enode.findOne({'where': {'enodeableId': widget.id, 'enodeableType': InputWidget.definition.name}}, function (err, enode) {
      if (!err) {
        ctx.result = {
          'id': enode.id,
          'created':enode.created,
          'updated': enode.updated,
          'data': {
            'id': widget.id,
            'type': widget.type,
            'subType': widget.subType
          }
        };
        next();
      } else {
        next();
      }
    });
  });
};



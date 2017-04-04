'use strict';

module.exports = function(Widget) {


  Widget.sayBlabla = function (yap) {
    console.log("Yapi yep");
  }

  Widget.observe('before save', function (ctx, next) {
    var Enode = Widget.app.models.Enode;
    if (ctx.isNewInstance) {
    } else {
    }
    next();
  });

  Widget.observe('after save', function (ctx, next) {
    var Enode = Widget.app.models.Enode;
    if (ctx.isNewInstance) {
      Enode.create({
        'enodeableId': ctx.instance.id,
        'enodeableType': Widget.definition.name
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
  Widget.afterRemote('create', function (ctx,widget, next) {
    var Enode = Widget.app.models.Enode;
    Enode.findOne({'where': {'enodeableId': widget.id, 'enodeableType': Widget.definition.name}}, function (err, enode) {
      if (!err) {
        //console.log(ctx.result);
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

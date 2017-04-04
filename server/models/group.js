'use strict';

module.exports = function(Group) {
  Group.observe('before save', function (ctx, next) {
    var Enode = Group.app.models.Enode;
    if (ctx.isNewInstance) {
    } else {
    }
    next();
  });

  Group.observe('after save', function (ctx, next) {
    var Enode = Group.app.models.Enode;
    if (ctx.isNewInstance) {
      Enode.create({
        'enodeableId': ctx.instance.id,
        'enodeableType': Group.definition.name
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
  Group.afterRemote('create', function (ctx,group, next) {
    var Enode = Group.app.models.Enode;
    Enode.findOne({'where': {'enodeableId': group.id, 'enodeableType': Group.definition.name}}, function (err, enode) {
      if (!err) {
        //console.log(ctx.result);
        ctx.result = {
          'id': enode.id,
          'created':enode.created,
          'updated': enode.updated,
          'data': {
            'id': group.id,
            'type': group.type,
            'subType': group.subType
          }
        };
        next();
      } else {
        next();
      }
    });
  });
};

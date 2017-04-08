'use strict';

module.exports = function(Project) {
  Project.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
      ctx.instance.updated = ctx.instance.created;
    } else {
      ctx.data.updated = new Date();
    }
    next();
  });

  Project.beforeRemote('create', function (ctx, widget, next) {
    console.log(ctx.args);
    if (ctx.args.token) {
      next();
    } else {
      //var e = new Error("Not allowed");
      //e.status = 405;
      next();
    }
  });

};


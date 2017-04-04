'use strict';

module.exports = function(Logic) {
  Logic.beforeRemote('create', function(context, user, next) {
    next();
  });
  Logic.observe('after save', function (ctx, next) {
    console.log("LA puta madre");
    if (ctx.isNewInstance) {
      ctx.result = {
        data: "Hola mundo"
      }
    } else {
      ctx.result.data = "ASDFASFAF";
    }
    next();
  });
};

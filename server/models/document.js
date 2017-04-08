'use strict';

module.exports = function(Document) {
  Document.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
      ctx.instance.updated = ctx.instance.created;
    } else {
      ctx.data.updated = new Date();
    }
    next();
  });

};

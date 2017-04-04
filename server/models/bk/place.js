'use strict';

module.exports = function(Place) {
  Place.beforeRemote('create', function(context, user, next) {
    context.args.data.created = Date.now();
    context.args.data.updated = context.args.data.created;
    next();
  });
};

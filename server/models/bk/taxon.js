'use strict';

module.exports = function(Taxon) {
  //var TAXA_RANKS = [
    //{ "rank": "Root", "level": 0 },
    //{ "rank": "Kingdom", "level": 100 },
    //{ "rank": "Phylum", "level": 200 },
    //{ "rank": "Class", "level": 300 },
    //{ "rank": "Orden", "level": 400 },
    //{ "rank": "Family", "level": 500 },
    //{ "rank": "Genus", "level": 600 },
    //{ "rank": "Species", "level": 700 }
  //];

  //var TAXA_EQUIVALENCES = [
    //{ "rank": "Division", "level": 200 },
  //];

  Taxon.beforeRemote('create', function(context, user, next) {
    context.args.data.created = Date.now();
    context.args.data.updated = context.args.data.created;
    context.args.data.explorerId = context.req.accessToken.userId;
    next();
  });
  Taxon.observe('before save', function (ctx, next) {
    if (!ctx.isNewInstance) {
      ctx.data.updated = new Date();
    }
    next();
  });

  //Taxon.taxaRanks = function (cb) {
    //cb (null, TAXA_RANKS);
  //};

  //Taxon.remoteMethod ("taxaRanks", {
    //"description": "Return the taxa rank list",
    //accepts: [
    //],
    //returns: [
    //{arg: "ranks", type:"object", root: "true"}
    //],
    //http: {path: '/taxaRanks', verb: "get"}
  //});
};




angular.module('copayApp.services')
  .factory('localStorageService', ($timeout) => {
    const root = {};
    const ls = ((typeof window.localStorage !== 'undefined') ? window.localStorage : null);

    if (!ls) { throw new Error('localstorage not available'); }

    root.get = function (k, cb) {
      return cb(null, ls.getItem(k));
    };

    /**
     * Same as setItem, but fails if an item already exists
     */
    root.create = function (name, value, callback) {
      root.get(name,
        (err, data) => {
          if (data) {
            return callback('EEXISTS');
          }
          return root.set(name, value, callback);
        });
    };

    root.set = function (k, v, cb) {
      ls.setItem(k, v);
      return cb();
    };

    root.remove = function (k, cb) {
      ls.removeItem(k);
      return cb();
    };

    return root;
  });

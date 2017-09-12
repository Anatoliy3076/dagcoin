/* eslint-disable no-unused-vars, no-undef */
const modules = [
  'ui.router',
  'angularMoment',
  'angular-carousel',
  'mm.foundation',
  'monospaced.qrcode',
  'monospaced.elastic',
  'gettext',
  'ngLodash',
  'uiSwitch',
  'bwcModule',
  'copayApp.filters',
  'copayApp.services',
  'copayApp.controllers',
  'copayApp.directives',
  'copayApp.addons',
  'ct.ui.router.extras',
  'ngRaven'
];

const copayApp = angular.module('copayApp', modules);
window.copayApp = angular.module('copayApp', modules);

angular.module('copayApp.filters', []);
angular.module('copayApp.services', []);
angular.module('copayApp.controllers', []);
angular.module('copayApp.directives', []);
angular.module('copayApp.addons', []);

const fs = require('fs');

const appData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
// Assumes that in generated production package.json doesn't have env object
const isProduction = !Object.prototype.hasOwnProperty.call(appData, 'env');

Raven
  .config('https://2b16cb28f5864d1db14e1db9cc2407ef@sentry.io/215634', {
    shouldSendCallback: () => isProduction,
    release: appData.version
  })
  .addPlugin(Raven.Plugins.Angular)
  .install();

if (!isProduction) {
  Raven.uninstall();
}

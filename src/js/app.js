/* eslint-disable no-unused-vars */
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
    'ngDialog',
    'ngAnimate',
];

const copayApp = angular.module('copayApp', modules);
window.copayApp = angular.module('copayApp', modules);

angular.module('copayApp.filters', []);
angular.module('copayApp.services', []);
angular.module('copayApp.controllers', []);
angular.module('copayApp.directives', []);
angular.module('copayApp.addons', []);

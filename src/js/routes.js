/* eslint-disable default-case,no-undef,import/no-extraneous-dependencies,import/no-unresolved,prefer-rest-params */
(function () {
    'use strict';

    let unsupported;
    let isaosp;

    if (window && window.navigator) {
        const rxaosp = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
        isaosp = (rxaosp && rxaosp[1] < 537);
        if (!window.cordova && isaosp) {
            unsupported = true;
        }
        if (unsupported) {
            window.location = '#/unsupported';
        }
    }

// Setting up route
    angular
        .module('copayApp')
        .config((historicLogProvider, $provide, $logProvider, $stateProvider, $urlRouterProvider, $compileProvider) => {
            $urlRouterProvider.otherwise('/');

            $logProvider.debugEnabled(true);
            $provide.decorator('$log', ['$delegate',
                function ($delegate) {
                    const historicLog = historicLogProvider.$get();

                    ['debug', 'info', 'warn', 'error', 'log'].forEach((level) => {
                        const orig = $delegate[level];
                        $delegate[level] = function () {
                            if (level === 'error') {
                                console.log(arguments);
                            }

                            let args = [].slice.call(arguments);
                            if (!Array.isArray(args)) args = [args];
                            args = args.map((v) => {
                                let value = v;
                                try {
                                    if (typeof value === 'undefined') {
                                        value = 'undefined';
                                    }
                                    if (!value) {
                                        value = 'null';
                                    }
                                    if (typeof value === 'object') {
                                        if (value.message) {
                                            value = value.message;
                                        } else {
                                            value = JSON.stringify(value);
                                        }
                                    }
                                    // Trim output in mobile
                                    if (window.cordova) {
                                        value = value.toString();
                                        if (value.length > 1000) {
                                            value = `${value.substr(0, 997)}...`;
                                        }
                                    }
                                } catch (e) {
                                    console.log('Error at log decorator:', e);
                                    value = 'undefined';
                                }
                                return value;
                            });
                            try {
                                if (window.cordova) {
                                    console.log(args.join(' '));
                                }
                                historicLog.add(level, args.join(' '));
                                orig(...args);
                            } catch (e) {
                                console.log('ERROR (at log decorator):', e, args[0]);
                            }
                        };
                    });
                    return $delegate;
                }
            ]);

            // whitelist 'chrome-extension:' for chromeApp to work with image URLs processed by Angular
            // link: http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page?lq=1
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);

            $stateProvider
                .state('splash', {
                    url: '/splash',
                    needProfile: false,
                    templateUrl: 'views/splash.html'
                });

            $stateProvider
                .state('translators', {
                    url: '/translators',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'views/translators.html'
                })
                .state('disclaimer', {
                    url: '/disclaimer',
                    needProfile: false,
                    templateUrl: 'views/disclaimer.html'
                })
                .state('walletHome', {
                    url: '/',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    deepStateRedirect: true,
                    sticky: true,
                    templateUrl: 'controllers/walletHome/walletHome.template.html',
                    params: {
                        selectedWallet: null
                    }
                })
                .state('send', {
                    url: '/send',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    deepStateRedirect: true,
                    sticky: true,
                    templateUrl: 'controllers/send/send.template.html'
                })
                .state('receive', {
                    url: '/receive',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    deepStateRedirect: true,
                    sticky: true,
                    templateUrl: 'controllers/receive/receive.template.html'
                })
                .state('contacts', {
                    url: '/contacts',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    deepStateRedirect: true,
                    sticky: true,
                    templateUrl: 'views/contacts.html'
                })
                .state('history', {
                    url: '/history',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    deepStateRedirect: true,
                    sticky: true,
                    templateUrl: 'views/history.html'
                })
                .state('unsupported', {
                    url: '/unsupported',
                    needProfile: false,
                    templateUrl: 'views/unsupported.html'
                })
                .state('payment', {
                    url: '/uri-payment/:data',
                    templateUrl: 'views/paymentUri.html',
                    needProfile: true
                })
                .state('selectWalletForPayment', {
                    url: '/selectWalletForPayment',
                    controller: 'walletForPaymentController',
                    needProfile: true,
                })
                .state('import', {
                    url: '/import',
                    needProfile: true,
                    templateUrl: 'views/import.html',
                })
                .state('importProfile', {
                    url: '/importProfile',
                    templateUrl: 'views/importProfile.html',
                    needProfile: false,
                })
                .state('importLegacy', {
                    url: '/importLegacy',
                    needProfile: true,
                    templateUrl: 'views/importLegacy.html',

                })
                .state('create', {
                    url: '/create',
                    templateUrl: 'views/create.html',
                    needProfile: true,
                })
                .state('copayers', {
                    url: '/copayers',
                    needProfile: true,
                    templateUrl: 'views/copayers.html',
                })
                .state('preferences', {
                    url: '/preferences',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'views/preferences.html',
                })
                .state('correspondentDevices', {
                    url: '/correspondentDevices',
                    walletShouldBeComplete: false,
                    needProfile: true,
                    deepStateRedirect: true,
                    sticky: true,
                    templateUrl: 'views/correspondentDevices.html',
                })
                .state('correspondentDevices.correspondentDevice', {
                    url: '/correspondentDevice',
                    walletShouldBeComplete: false,
                    needProfile: true,
                    templateUrl: 'views/correspondentDevice.html',
                })
                .state('correspondentDevices.editCorrespondentDevice', {
                    url: '/editCorrespondentDevice',
                    walletShouldBeComplete: false,
                    needProfile: true,
                    templateUrl: 'views/editCorrespondentDevice.html',
                })
                .state('correspondentDevices.addCorrespondentDevice', {
                    url: '/addCorrespondentDevice',
                    needProfile: true,
                    templateUrl: 'views/addCorrespondentDevice.html',
                })
                .state('correspondentDevices.inviteCorrespondentDevice', {
                    url: '/inviteCorrespondentDevice',
                    walletShouldBeComplete: false,
                    needProfile: true,
                    templateUrl: 'views/inviteCorrespondentDevice.html',
                })
                .state('correspondentDevices.acceptCorrespondentInvitation', {
                    url: '/acceptCorrespondentInvitation',
                    walletShouldBeComplete: false,
                    needProfile: true,
                    templateUrl: 'views/acceptCorrespondentInvitation.html',
                })
                .state('authConfirmation', {
                    url: '/authConfirmation',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'views/authConfirmation.html',
                })
                .state('preferencesDeviceName', {
                    url: '/preferencesDeviceName',
                    walletShouldBeComplete: false,
                    needProfile: false,
                    templateUrl: 'views/preferencesDeviceName.html',
                })
                .state('preferencesLanguage', {
                    url: '/preferencesLanguage',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'views/preferencesLanguage.html',
                })

                .state('preferencesAdvanced', {
                    url: '/preferencesAdvanced',
                    templateUrl: 'views/preferencesAdvanced.html',
                    walletShouldBeComplete: true,
                    needProfile: true,
                })
                .state('preferencesColor', {
                    url: '/preferencesColor',
                    templateUrl: 'views/preferencesColor.html',
                    walletShouldBeComplete: true,
                    needProfile: true,
                })

                .state('preferencesAlias', {
                    url: '/preferencesAlias',
                    templateUrl: 'views/preferencesAlias.html',
                    walletShouldBeComplete: true,
                    needProfile: true,
                })
                .state('preferencesEmail', {
                    url: '/preferencesEmail',
                    templateUrl: 'views/preferencesEmail.html',
                    walletShouldBeComplete: true,
                    needProfile: true
                })
                .state('information', {
                    url: '/information',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'views/preferencesInformation.html'
                })
                .state('about', {
                    url: '/settings/about',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'controllers/settings/about/about.template.html'
                })
                .state('logs', {
                    url: '/settings/about/logs',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'controllers/settings/about/logs/logs.template.html'
                })

                .state('about_device', {
                    url: '/settings/about_device',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'controllers/settings/about_device/about_device.template.html'
                })
                .state('export', {
                    url: '/export',
                    templateUrl: 'views/export.html',
                    walletShouldBeComplete: true,
                    needProfile: true
                })
                .state('paperWallet', {
                    url: '/paperWallet',
                    templateUrl: 'views/paperWallet.html',
                    walletShouldBeComplete: true,
                    needProfile: true
                })
                .state('backup', {
                    url: '/backup',
                    templateUrl: 'views/backup.html',
                    walletShouldBeComplete: true,
                    needProfile: true
                })
                .state('recoveryFromSeed', {
                    url: '/recoveryFromSeed',
                    walletShouldBeComplete: true,
                    needProfile: true,
                    templateUrl: 'views/recoveryFromSeed.html',
                })
                .state('settings', {
                    url: '/settings',
                    title: 'Settings',
                    needProfile: true,
                    templateUrl: 'controllers/settings/settings.template.html'
                })
                .state('settingsSecurity', {
                    url: '/settings_security',
                    needProfile: true,
                    templateUrl: 'controllers/settings/security/security.template.html'
                })
                .state('settingsBackup', {
                    url: '/settings_backup',
                    needProfile: true,
                    templateUrl: 'controllers/settings/backup/backup.template.html',
                })
                .state('settingsSystem', {
                    url: '/settings_system',
                    needProfile: true,
                    templateUrl: 'controllers/settings/system/system.template.html',
                })

                .state('warning', {
                    url: '/warning',
                    controller: 'warningController',
                    templateUrl: 'views/warning.html',
                    needProfile: false,
                })
                .state('add', {
                    url: '/add',
                    needProfile: true,
                    templateUrl: 'views/add.html',
                })
                .state('cordova', { // never used
                    url: '/cordova/:status/:isHome',
                    controller($rootScope, $state, $stateParams, $timeout, go, isCordova) {
                        console.log(`cordova status: ${$stateParams.status}`);
                        switch ($stateParams.status) {
                            case 'resume':
                                $rootScope.$emit('Local/Resume');
                                break;
                            case 'backbutton':
                                if (isCordova && $stateParams.isHome === 'true' && !$rootScope.modalOpened) {
                                    navigator.app.exitApp();
                                } else {
                                    $rootScope.$emit('closeModal');
                                }
                                break;
                        }
                        // why should we go home on resume or backbutton?
                        /*
                         $timeout(function() {
                         $rootScope.$emit('Local/SetTab', 'walletHome', true);
                         }, 100);
                         go.walletHome();
                         */
                    },
                    needProfile: false,
                });
        })
        .run(($rootScope, $state, $log, uriHandler, isCordova, profileService, $timeout, nodeWebkit, uxLanguage, animationService, backButton, go) => {
            FastClick.attach(document.body);

            uxLanguage.init();

            // Register URI handler, not for mobileApp
            if (!isCordova) {
                uriHandler.register();
            }

            if (nodeWebkit.isDefined()) {
                const gui = require('nw.gui');
                const win = gui.Window.get();
                win.setResizable(false);
                const nativeMenuBar = new gui.Menu({
                    type: 'menubar',
                });
                try {
                    nativeMenuBar.createMacBuiltin('DAGCOIN');
                } catch (e) {
                    $log.debug('This is not OSX');
                }
                win.menu = nativeMenuBar;
            }

            $rootScope.previousState = false;

            $rootScope.$on('$stateChangeStart', (event, toState, toParams, from, fromParams) => {

                backButton.menuOpened = false;
                go.swipe();

                if (!profileService.profile && toState.needProfile) {
                    // Give us time to open / create the profile
                    event.preventDefault();

                    // Try to open local profile
                    profileService.loadAndBindProfile((err) => {
                        if (err) {
                            if (err.message && err.message.match('NOPROFILE')) {
                                $log.debug('No profile... redirecting');
                                $state.transitionTo('splash');
                            } else if (err.message && err.message.match('NONAGREEDDISCLAIMER')) {
                                $log.debug('Display disclaimer... redirecting');
                                $state.transitionTo('disclaimer');
                            } else {
                                throw new Error(err); // TODO
                            }
                        } else {
                            $log.debug('Profile loaded ... Starting UX.');
                            $state.transitionTo(toState.name || toState, toParams);
                        }
                    });
                }

                if (
                    profileService.focusedClient && !profileService.focusedClient.isComplete() &&
                    toState.walletShouldBeComplete
                ) {
                    $state.transitionTo('copayers');
                    event.preventDefault();
                }

                $rootScope.previousState = from;
            });
        });
}());

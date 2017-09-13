(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('preferencesGlobalController',
    function ($scope, $q, $rootScope, $timeout, $log, configService, uxLanguage, pushNotificationsService, profileService,
      fundingExchangeProviderService, $modal, animationService, chooseFeeTypeService, changeWalletTypeService) {
      const conf = require('byteballcore/conf.js');
      const self = this;
      self.fundingNodeSettings = {};
      self.isLight = conf.bLight;
      self.canChangeWalletType = changeWalletTypeService.canChange();

      $scope.encrypt = !!profileService.profile.xPrivKeyEncrypted;

      self.initFundingNode = () => {
        self.fundingNode = fundingExchangeProviderService.isActivated();
        self.fundingNodeSettings = fundingExchangeProviderService.getSettings();

        fundingExchangeProviderService.canEnable().then(() => {
          self.canEnableFundingNode = true;
        });
      };

      this.init = function () {
        const config = configService.getSync();
        this.type = (conf.bLight ? 'light wallet' : 'full wallet');
        this.unitName = config.wallet.settings.unitName;
        this.dagUnitName = config.wallet.settings.dagUnitName;
        this.deviceName = config.deviceName;
        this.myDeviceAddress = require('byteballcore/device.js').getMyDeviceAddress();
        this.hub = config.hub;
        this.currentLanguageName = uxLanguage.getCurrentLanguageName();
        this.torEnabled = conf.socksHost && conf.socksPort;
        $scope.pushNotifications = config.pushNotifications.enabled;

        self.initFundingNode();
      };

      const unwatchPushNotifications = $scope.$watch('pushNotifications', (newVal, oldVal) => {
        if (newVal === oldVal) return;
        const opts = {
          pushNotifications: {
            enabled: newVal,
          },
        };
        configService.set(opts, (err) => {
          if (opts.pushNotifications.enabled) {
            pushNotificationsService.pushNotificationsInit();
          } else {
            pushNotificationsService.pushNotificationsUnregister();
          }
          if (err) $log.debug(err);
        });
      });

      const unwatchEncrypt = $scope.$watch('encrypt', (val) => {
        const fc = profileService.focusedClient;
        if (!fc) return;

        if (val && !fc.hasPrivKeyEncrypted()) {
          $rootScope.$emit('Local/NeedsPassword', true, null, (err, password) => {
            if (err || !password) {
              $scope.encrypt = false;
              return;
            }
            profileService.setPrivateKeyEncryptionFC(password, () => {
              $rootScope.$emit('Local/NewEncryptionSetting');
              $scope.encrypt = true;
            });
          });
        } else if (!val && fc.hasPrivKeyEncrypted()) {
          profileService.unlockFC(null, (err) => {
            if (err) {
              $scope.encrypt = true;
              return;
            }
            profileService.disablePrivateKeyEncryptionFC((disablePrivateKeyEncryptionFCError) => {
              $rootScope.$emit('Local/NewEncryptionSetting');
              if (disablePrivateKeyEncryptionFCError) {
                $scope.encrypt = true;
                $log.error(disablePrivateKeyEncryptionFCError);
                return;
              }
              $scope.encrypt = false;
            });
          });
        }
      });

      const unwatchFundingNode = $scope.$watch(() => self.fundingNode, (newVal, oldVal) => {
        if (oldVal === null || oldVal === undefined || newVal === oldVal) {
          return;
        }

        fundingExchangeProviderService.canEnable().then(() => {
          fundingExchangeProviderService.update(newVal).then(() => {
            self.fundingNodeSettings = fundingExchangeProviderService.getSettings();
          });
        }, () => {
          self.fundingNode = false;
        });
      }, true);

      function getCorrectValue(oldValue, newValue, isFloat) {
        const newValueParsed = isFloat ? parseFloat(newValue) : parseInt(newValue, 10);
        if (newValue && newValueParsed.toString() === newValue.toString() && newValueParsed >= 0) {
          return newValueParsed;
        }
        return oldValue;
      }

      self.onFundingNodeSettingBlur = function () {
        const oldSettings = fundingExchangeProviderService.getSettings();
        const newSettings = {
          exchangeFee: getCorrectValue(oldSettings.exchangeFee, self.fundingNodeSettings.exchangeFee, true),
          totalBytes: getCorrectValue(oldSettings.totalBytes, self.fundingNodeSettings.totalBytes, false),
          bytesPerAddress: getCorrectValue(oldSettings.bytesPerAddress, self.fundingNodeSettings.bytesPerAddress, false),
          maxEndUserCapacity: getCorrectValue(oldSettings.maxEndUserCapacity, self.fundingNodeSettings.maxEndUserCapacity, false)
        };

        fundingExchangeProviderService.setSettings(newSettings).then(() => {
          self.fundingNodeSettings = fundingExchangeProviderService.getSettings();
        }, () => {
          self.fundingNodeSettings = fundingExchangeProviderService.getSettings();
        });
      };

      $scope.$on('$destroy', () => {
        unwatchPushNotifications();
        unwatchEncrypt();
        unwatchFundingNode();
      });

      chooseFeeTypeService.getFeeDefaultMethod()
      .then((res) => {
        self.typeOfPaymentFee = res;
      });

      self.enableHubOption = chooseFeeTypeService.getCanBeSwitchedToHub();
      self.changeTypeOfPayment = changeTypeOfPayment;

      self.changeWalletType = function () {
        changeWalletTypeService.change();
      };

      function changeTypeOfPayment(model) {
        if (model === 'hub' && !self.enableHubOption) {
          self.typeOfPaymentFee = 'bytes';
        } else {
          self.typeOfPaymentFee = model;
        }

        chooseFeeTypeService.setUpFeeDefaultMethod(self.typeOfPaymentFee).then(() => {});
      }
    });
}());

/**
OrangeNotification - Notification Service for Angular Apps.
The MIT License (MIT)

Copyright (c) [2015] [Knut Gaute Vardenær]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  'use strict';

  angular
  .module('orangeNotification', [])
  .provider('orangeNotification', orangeNotificationProvider)
  .directive('orangeNotification', orangeNotification);

  //////////

  function orangeNotificationProvider() {
    var self = this;
    var expiration = 5; // seconds
    var directiveTemplateUrl = '';
    var withFilter = null;

    self.setNotificationExpiraiton = function (value) {
      if (!isNaN(value)) {
        expiration = value;
      }
    }

    self.setFilter = function (value) {
      withFilter = value;
    }

    self.setDirectiveTemplateUrl = function (value) {
      if (value) {
        directiveTemplateUrl = value;
      } else {
        throw 'orangeNotificationProvider :: Bad template url given';
      }
    }

    self.$get = ['$filter', '$q', function ($filter, $q) {
      function NotificationService(oExpiration, oDirectiveTemplateUrl, oWithFilter) {
        var self = this;
        var myFilter = null;

        if (oWithFilter) {
          myFilter = $filter(oWithFilter);
        }

        self.notifications = [];

        self.getDirectiveTemplateUrl = getDirectiveTemplateUrl;
        self.success = success;
        self.info = info;
        self.warning = warning;
        self.error = error;
        self.wait = wait;
        self.dialog = dialog;

        return self;

        //////////

        function pushNotification(notification) {
          self.notifications.push(notification);
        }

        function addNotification(message, type) {
          var notification = {
            message: formatMessage(message),
            type: type,
            expires: new Date().getTime() + oExpiration * 1000,
            discarded: false
          };

          pushNotification(notification);
        }

        function formatMessage(message){
          return myFilter === null ? message : myFilter(message);
        }

        //////////

        function getDirectiveTemplateUrl() {
          if (!oDirectiveTemplateUrl){
            throw 'orangeNotificationService :: No template url given';
          }
          return oDirectiveTemplateUrl;
        }

        function success(message) {
          addNotification(message, 'success');
        }

        function info(message) {
          addNotification(message, 'info');
        }

        function warning(message) {
          addNotification(message, 'warning');
        }

        function error(message) {
          addNotification(message, 'error');
        }

        function dialog(message) {
          var args = arguments;
          var dialogOptions = [];

          if (args.length < 2) {
            throw 'Expected (message, args[]), got ' + args;
          }

          for (var i = 1; i < arguments.length; i++) {
            if (typeof args[i] !== 'object') {
              throw 'Expected object, got ' + typeof args[i];
            } else {
              dialogOptions.push(args[i]);
            }
          }

          var deferred = $q.defer();

          var notification = {
            dialogOptions: dialogOptions,
            message: formatMessage(message),
            type: 'dialog',
            discarded: false,
            resolve: function (val) {
              deferred.resolve(val);
            },
            reject: function () {
              deferred.reject();
            }
          };

          deferred.promise.finally(function () {
            notification.discarded = true;
          });

          pushNotification(notification);

          return deferred.promise;
        }

        function wait(message, promise) {
          var notification = {
            message: formatMessage(message),
            type: 'wait',
            discarded: false,
            promise: promise
          };

          pushNotification(notification);

          return notification.promise.finally(function () {
            notification.discarded = true;
          });
        }
      }
      return new NotificationService(expiration, directiveTemplateUrl, withFilter);
    }];
  }

  //////////

  orangeNotification['$inject'] = ['orangeNotification', '$interval'];

  function orangeNotification(ns, $interval) {
    var directive = {
      restrict: 'AE',
      templateUrl: ns.getDirectiveTemplateUrl(),
      scope: true,
      replace: true,
      controller: ['$scope', Controller],
      controllerAs: 'vm'
    }

    return directive;

    //////////

    function Controller($scope) {
      var vm = this;

      vm.notifications = ns.notifications;
      vm.hasExpired = hasExpired;
      vm.getIconType = getIconType;

      init();

      //////////

      function init() {
        var loop = $interval(function () {
          var doApply = false;

          for (var i = vm.notifications.length - 1; i >= 0 ; --i) {
            if (hasExpired(vm.notifications[i])) {
              vm.notifications.splice(i, 1);
              doApply = true;
            }
          }

          if (doApply) {
            $scope.$apply();
          }

        }, 200, 0, false);

        $scope.$on('$destroy', function () {
          if (angular.isDefined(loop)) {
            $interval.cancel(loop);
          }
        });
      }

      function getIconType(notification) {
        switch (notification.type) {
          case 'success': return 'fa fa-check';
          case 'info': return 'fa fa-exclamation';
          case 'warning': return 'fa fa-fire';
          case 'error': return 'fa fa-close';
          case 'wait': return 'fa fa-circle-o-notch fa-spin';
          case 'dialog': return 'fa fa-question';
        }
      }

      function hasExpired(notification) {
        if (notification.discarded !== true && notification.expires) {
          return notification.expires < now();
        } else {
          return notification.discarded;
        }

        function now() {
          return new Date().getTime();
        }
      }
    }

  }

})();

angular
.module('exampleOrange', ['orangeNotification'])
.config(configure)
.controller('ExampleCtrl', ExampleCtrl);

//////////

configure.$inject = ['orangeNotificationProvider'];

function configure(orangeNotificationProvider){
  orangeNotificationProvider.setDirectiveTemplateUrl('orange-notification.html');
}

//////////

ExampleCtrl.$inject = ['orangeNotification'];

function ExampleCtrl(ns) {
  ns.info('Hello World!');
}

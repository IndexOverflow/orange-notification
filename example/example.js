angular
.module('exampleOrange', ['orangeNotification'])
.config(configure)
.filter('test', testFilter)
.controller('ExampleCtrl', ExampleCtrl);

//////////

configure.$inject = ['orangeNotificationProvider'];

function configure(orangeNotificationProvider){
  orangeNotificationProvider.setDirectiveTemplateUrl('/example/example-implementation.html');
  orangeNotificationProvider.setNotificationExpiraiton(5);
  orangeNotificationProvider.setFilter('test');
}

//////////

function testFilter() {
  return function(input){
    return 'Message: ' + input;
  }
}

//////////

ExampleCtrl.$inject = ['orangeNotification', '$timeout'];

function ExampleCtrl(ns, $timeout) {
  ns.info('I am an info message');
  ns.warning('Darn, I have to warn you about something!');
  ns.error('Oh no, something didn\'t work');
  ns.success('Puh, crisis averted');

  var promise = $timeout(function(){
    // ... waiting
  }, 10000, false);

  ns.wait('I\'ll stay here until my promise is resolved ...', promise);


}

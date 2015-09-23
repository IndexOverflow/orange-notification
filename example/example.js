angular
.module('exampleOrange', ['orangeNotification'])
.config(configure)
.filter('test', testFilter)
.filter('valueTest', valueTestFilter)
.controller('ExampleCtrl', ExampleCtrl);

//////////

configure.$inject = ['orangeNotificationProvider'];

function configure(orangeNotificationProvider){
  orangeNotificationProvider.setDirectiveTemplateUrl('/example/example-implementation.html');
  orangeNotificationProvider.setNotificationExpiraiton(5);
  orangeNotificationProvider.setFilter('valueTest');
}

//////////

function testFilter() {
  return function(input){
    return 'Message: ' + input;
  }
}

function valueTestFilter() {
  return function(input, value) {
    var o = '';

    if (value){
      o = ' (' + value.test + ') ';
    }
    return 'Message: ' + input + o;
  }
}

//////////

ExampleCtrl.$inject = ['orangeNotification', '$timeout'];

function ExampleCtrl(ns, $timeout) {
  ns.info({text: 'I am an info message', test: 'btw, I also use a filter value for extra coolness'});
  ns.warning('Darn, I have to warn you about something!');
  ns.error('Oh no, something didn\'t work');
  ns.success('Puh, crisis averted');

  var promise = $timeout(function(){
    // ... waiting
  }, 10000, false);

  ns.wait('I\'ll stay here until my promise is resolved ...', promise);


}

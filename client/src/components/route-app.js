angular.module('app', ['ngRoute', 'routeAppControllers'])
  .config(['$routeProvider',
    function($routeProvider){
      $routeProvider
      .when('/home', {
        templateUrl: './views/login.html',
        controller: 'homeCtrl'
      })
      .when('/game', {
        templateUrl: './views/canvas.html',
        controller: 'gameCtrl'
      })
      .when('/end', {
        templateUrl: './views/end.html',
        controller: 'endCtrl'
      })
      .otherwise({
           redirectTo: '/home'
      })
    }
  ]);

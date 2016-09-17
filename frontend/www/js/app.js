// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'ion-floating-menu', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
	$ionicPlatform.registerBackButtonAction(function (event) {
	  if ($ionicHistory.currentStateName() === 'home'){
        event.preventDefault();
      } else {
        $ionicHistory.goBack();
      }
    }, 100);

  });
})

.config(function($stateProvider, $urlRouterProvider) {
   $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "menu.html",
      controller: 'AppCtrl'
    })
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'welcome.html',
	  controller: 'WelcomeCtrl'
    })
    .state('app.home', {
      url: '/home',
	  views: {
        'menuContent' :{
          templateUrl: "home.html",
		  controller: 'HomeCtrl'
        }
	  }
    })
	.state('app.recipe', {
      url: '/recipe',
	  views: {
        'menuContent' :{
          templateUrl: "recipe.html",
		  controller: 'RecipeCtrl'
        }
	  }
	})
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');
})

.service('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
});

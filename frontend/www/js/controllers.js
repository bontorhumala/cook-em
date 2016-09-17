angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, UserService, $ionicSideMenuDelegate, $ionicActionSheet, $state, $ionicLoading) {
	$scope.user = UserService.getUser();
	$scope.showLogOutMenu = function() {
		var hideSheet = $ionicActionSheet.show({
			destructiveText: 'Logout',
			titleText: 'Are you sure you want to logout?',
			cancelText: 'Cancel',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
				  template: 'Logging out...'
				});

        // Facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
		  window.localStorage.removeItem("starter_facebook_user");
          $state.go('welcome');
        },
        function(fail){
          $ionicLoading.hide();
        });
			}
		});
	};

})

.controller('WelcomeCtrl', function($scope, $state, $q, UserService, $ionicViewService, $ionicLoading) {
  var user = UserService.getUser('facebook');
  if(user.userID){
	$ionicViewService.nextViewOptions({disableBack: true});
	$state.go('app.home');
  }
  
  // This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
				userID: profileInfo.id,
				name: profileInfo.name,
				email: profileInfo.email,
                picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });
      $ionicLoading.hide();
	  $ionicViewService.nextViewOptions({disableBack: true});
      $state.go('app.home');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
				console.log(response);
        info.resolve(response);
      },
      function (response) {
				console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
	console.log('FB signin');
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

    		// Check if we have our user saved
    		var user = UserService.getUser('facebook');

    		if(!user.userID){
					getFacebookProfileInfo(success.authResponse)
					.then(function(profileInfo) {
						// For the purpose of this example I will store user data on local storage
						UserService.setUser({
							authResponse: success.authResponse,
							userID: profileInfo.id,
							name: profileInfo.name,
							email: profileInfo.email,
							picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
						});
					    $ionicViewService.nextViewOptions({disableBack: true});
						$state.go('app.home');
					}, function(fail){
						// Fail get profile info
						console.log('profile info fail', fail);
					});
				}else{
					$state.go('welcome');
				}
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
				// but has not authenticated your app
        // Else the person is not logged into Facebook,
				// so we're not sure if they are logged into this app or not.

				console.log('getLoginStatus', success.status);

				$ionicLoading.show({
          template: 'Logging in...'
        });

				// Ask the permissions you need. You can learn more about
				// FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };
})

.controller('HomeCtrl', function($scope, $rootScope, $cordovaCamera, UserService, $ionicActionSheet, $state, $ionicLoading){
	$scope.user = UserService.getUser();
	
	$scope.takeImage = function() {
		// 2
		var options = {
			destinationType : Camera.DestinationType.DATA_URL,
			sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
			allowEdit : false,
			encodingType: Camera.EncodingType.JPEG,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false
		};
		
		// 3
		$cordovaCamera.getPicture(options).then(function(imageData) {
		    // upload to Google
		}, function(err) {
			console.log(err);
		});
    }
	
	$scope.recipes = [
		{ img: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg', name: 'delj'},
		{ img: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png', name: 'WUIDW'},
		{ img: 'https://pbs.twimg.com/profile_images/692904108424982528/0PESpDwT.jpg', name: 'diid'}
	];
	
	$scope.gotoRecipe = function(recipe) {
		$rootScope.selectedRecipe = recipe;
		$state.go('app.recipe');
	};
	
	$scope.showLogOutMenu = function() {
		var hideSheet = $ionicActionSheet.show({
			destructiveText: 'Logout',
			titleText: 'Are you sure you want to logout?',
			cancelText: 'Cancel',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
				  template: 'Logging out...'
				});

        // Facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
		  window.localStorage.removeItem("starter_facebook_user");
          $state.go('welcome');
        },
        function(fail){
          $ionicLoading.hide();
        });
			}
		});
	};
})

.controller('RecipeCtrl', function($scope, $rootScope, UserService, $ionicActionSheet, $state, $ionicLoading){
	$scope.recipe = $rootScope.selectedRecipe;
	
	$scope.steps=['Makan', 'Potong', 'Rebus'];
	
	
})
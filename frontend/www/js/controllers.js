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

.controller('WelcomeCtrl', function($scope, $state, $q, UserService, $ionicHistory, $ionicLoading) {
  var user = UserService.getUser('facebook');
  if(user.userID){
	$ionicHistory.nextViewOptions({disableBack: true});
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
	  $ionicHistory.nextViewOptions({disableBack: true});
      $state.go('app.home');
    }, function(fail){
      // Fail get profile info
      console.log('COOK_INFO::profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('COOK_INFO::fbLoginError', error);
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
	console.log('COOK_INFO::FB signin');
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('COOK_INFO::getLoginStatus', success.status);

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
					    $ionicHistory.nextViewOptions({disableBack: true});
						$state.go('app.home');
					}, function(fail){
						// Fail get profile info
						console.log('COOK_INFO::profile info fail', fail);
					});
				}else{
					$state.go('welcome');
				}
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
				// but has not authenticated your app
        // Else the person is not logged into Facebook,
				// so we're not sure if they are logged into this app or not.

				console.log('COOK_INFO::getLoginStatus', success.status);

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

.controller('HomeCtrl', function($scope, $rootScope, ElasticService, esFactory, $cordovaFile, $cordovaFileTransfer, $cordovaCamera, UserService, $ionicActionSheet, $ionicPopup, $state, $ionicLoading){
	$scope.user = UserService.getUser();
	
	$scope.show = function() {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner></ion-spinner>'
      });
    };

    $scope.hide = function(){
          $ionicLoading.hide();
    };

	$scope.takeImage = function() {
		var me = this;
		me.image_description = '';
		me.detection_type = 'LABEL_DETECTION';

		me.detection_types = {
          LABEL_DETECTION: 'label',
          TEXT_DETECTION: 'text',
          LOGO_DETECTION: 'logo',
          LANDMARK_DETECTION: 'landmark'
        };

		var api_key = 'AIzaSyB9c9_SQMteDaSDAXRluwjVjM6X4eXQRRI';

		var options = {
			destinationType : Camera.DestinationType.DATA_URL,
			sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
			encodingType: Camera.EncodingType.JPEG,
			popoverOptions: CameraPopoverOptions,
			correctOrientation: true,
            cameraDirection: 0,
			saveToPhotoAlbum: false
		};

		$cordovaCamera.getPicture(options).then(function(imageData) {
			$scope.show($ionicLoading);
			console.log("frontend get imageData");
			me.current_image = "data:image/jpeg;base64," + imageData;
            me.image_description = '';
            me.locale = '';

            var vision_api_json = {
              "requests":[
                {
                  "image":{
                    "content": imageData
                  },
                  "features":[
                    {
                      "type": me.detection_type,
                      "maxResults": 10
                    }
                  ]
                }
              ]
            };

            var file_contents = JSON.stringify(vision_api_json);

            $cordovaFile.writeFile(
                cordova.file.applicationStorageDirectory,
                'file.json',
                file_contents,
                true
            ).then(function(result){
				console.log("frontend got writeFile result");
                var headers = {
                    'Content-Type': 'application/json'
                };

                options.headers = headers;
                var server = 'https://vision.googleapis.com/v1/images:annotate?key=' + api_key;
                var filePath = cordova.file.applicationStorageDirectory + 'file.json';

                $cordovaFileTransfer.upload(server, filePath, options, true)
                    .then(function(result){
                        var res = JSON.parse(result.response);
                        var key = me.detection_types[me.detection_type] + 'Annotations';
						// me.image_description = res.responses[0][key][5].description;
						var items = [];
						console.log(res.responses[0][key].length);
						for (item in res.responses[0][key]){
							items.push(res.responses[0][key][item].description);
						}

						console.log("Elastic searching...");
					//	var QUERY = items;
						$scope.queries = items;
						var QUERY = ["avocad", "Nectarines"];
						$rootScope.query = QUERY;
						var queries = "[";
						for (q in QUERY){
							queries = queries + '{"fuzzy":{"keywords":"' + QUERY[q] + '"}},';
						}
						queries = queries.substring(0, queries.length - 1);
						queries = queries + ']';
						ElasticService.search({
							index: 'cookem',
							type: 'recipes',
							body: JSON.parse('{"query": { "bool": { "minimum_number_should_match": 1, "should":' + queries + '}}}')
							//body: {q: JSON.parse('{"query": { "bool": { "minimum_number_should_match": 1, "should":' + queries + '}}}')}
						}).then(function (response) {
							$scope.hide($ionicLoading);
							console.log("Elastic search response");
							$scope.recipes = response.hits.hits;
						}, function (error) {
							console.log("ES error gan");
							console.trace(error.message);
						});

						// showAlert(me.image_description);
                  }, function(err){
                    alert('An error occurred while uploading the file');
                  });
            }, function(err){
				console.log("frontend writing error");
                alert('An error occurred while trying to write the file');
            });

        }, function(err) {
			console.log("frontend taking pic error");
			console.log(err);
		});
		$scope.hide($ionicLoading);
    }

	var showAlert = function(imgDesc) {
      var alertPopup = $ionicPopup.alert({
        title: 'Deskripsinya:',
        template: imgDesc
      });

      alertPopup.then(function(res) {
        console.log('Thank you for using Google Vision Cloud');
      });
    };

	$scope.recipes = [];

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
	var QUERY = $rootScope.query;
	for(mat in $scope.recipe._source.comp){
      var m = $scope.recipe._source.comp[mat].mat;
      if(QUERY.indexOf(m) > -1){
        $scope.recipe._source.comp[mat]["cl"] = "green";
      }else{
        $scope.recipe._source.comp[mat]["cl"] = "grey";
      }
    }

	$scope.steps=['Makan', 'Potong', 'Rebus'];


})

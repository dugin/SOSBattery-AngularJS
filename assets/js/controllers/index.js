angular.module('index.controllers', ['firebase'])


.controller('indexCtrl', function ($scope) {

    $scope.onLogin =  (username, password) => {

    let ref = new Firebase("https://flickering-heat-3899.firebaseio.com/");


    function authHandler(error, authData) {
 if (error) {
   console.log("Login Failed!", error);
 } else {
   window.location.href = "choice.html";
   console.log("Authenticated successfully with payload:", authData);
 }
}
      // Or with an email/password combination
    ref.authWithPassword({
    email    : username,
    password : password
    }, authHandler);


     }


});

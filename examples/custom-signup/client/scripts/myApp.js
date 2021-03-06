var myApp = angular.module('myApp', [
  'ngCookies', 'auth0', 'ngRoute', 'authInterceptor'
]);


myApp.run(function ($rootScope, $location, $route, AUTH_EVENTS, $timeout) {
  $rootScope.$on('$routeChangeError', function () {
    var otherwise = $route.routes && $route.routes.null && $route.routes.null.redirectTo;
    $timeout(function () {
      $location.path(otherwise);
    });
  });
});

function isAuthenticated($q, $timeout, auth) {
  var deferred = $q.defer();

  auth.loaded.then(function () {
    if (auth.isAuthenticated) {
      deferred.resolve();
    } else {
      deferred.reject();
    }
  });
  return deferred.promise;
}

myApp.config(function ($routeProvider, authProvider, $httpProvider) {
  $routeProvider
  .when('/logout',  {
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .when('/login',   {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  })
  .when('/', {
    templateUrl: 'views/root.html',
    controller: 'RootCtrl',
    resolve: { isAuthenticated: isAuthenticated }
  })
  .otherwise({ redirectTo: '/login' });

  authProvider.init({
    domain: 'contoso.auth0.com',
    clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
    // TODO set your own callbackURL, for instance http://localhost:1337/
    callbackURL: document.location.href
  });

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might 
  // want to check the delegation-token example
  $httpProvider.interceptors.push('authInterceptor');
});

define(['angular', 'auth0', 'auth0-angular', 'angular-cookies', 'angular-route'], function (angular, Auth0) {
  var myApp = angular.module('myApp', [
    'ngCookies', 'auth0', 'ngRoute', 'authInterceptor'
  ]);

  myApp.run(function ($rootScope, $location, $route, AUTH_EVENTS, $timeout) {
   $rootScope.$on('$routeChangeError', function () {
     var otherwise = $route.routes && $route.routes.null && $route.routes.null.redirectTo;
      // Access denied to a route, redirect to otherwise
      $timeout(function () {
        $location.path(otherwise);
      });
    });
  });

  function isAuthenticated($q, auth) {
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
      /* isAuthenticated will prevent user access to forbidden routes */
      resolve: { isAuthenticated: isAuthenticated }
    })
    .otherwise({ redirectTo: '/login' });

    authProvider.init({
      domain: 'contoso.auth0.com',
      clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
      // TODO Set this to your callbackURL, for instance http://localhost:1337/examples/widget/
      callbackURL: document.location.href
    },
    // Here we are specifying which constructor to use. If you are using
    // Auth0 widget you may want to inject Auth0Widget constructor here.
    Auth0);

    // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
    // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might 
    // want to check the delegation-token example
    $httpProvider.interceptors.push('authInterceptor');
  });

  return myApp;
});

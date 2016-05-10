angular.module('todoApp', ['ui.router', 'ngMaterial'])
  .controller('TodoListController', function ($http, $rootScope, $scope, $mdDialog, TodoListService, $mdMedia, $mdToast) {
    var todoList = this
    todoList.todos = [
      {text: 'learn angular', done: true},
      {text: 'build an angular app', done: false}]
    todoList.regisList = TodoListService.get();

    $('.modal-trigger').leanModal();

    todoList.user = {
      firstName: '',
      lastName: '',
      id: '',
      password: ''
    };

    ///////////////////////////

    ///////////////////////////

    todoList.addTodo = function () {
      todoList.todos.push({text: todoList.todoText, done: false})
      todoList.todoText = ''
    }

    todoList.remaining = function () {
      var count = 0
      angular.forEach(todoList.todos, function (todo) {
        count += todo.done ? 0 : 1
      })
      return count
    }

    todoList.archive = function () {
      var oldTodos = todoList.todos
      todoList.todos = []
      angular.forEach(oldTodos, function (todo) {
        if (!todo.done) todoList.todos.push(todo)
      })
    }

    todoList.getCourse = function () {
      $http.get('https://whsatku.github.io/skecourses/combined.json').success(function(data){
        $rootScope.courseList = $.map(data, function(value, index) {return [value];});
      
      angular.forEach($rootScope.courseList, function (todo) {
        //console.log(todo.id)
          $http.get('https://whsatku.github.io/skecourses/sections/' + todo.id + '.json').success(function(data){
                  //console.log(todo)
                  todo["haveSec"] = true;
          }).error(function (error, status){
              //console.log(todo)
              todo["haveSec"] = false;
          }); 
      })


      });
      console.log($rootScope.account)
      $http.get('http://52.37.98.127:3000/v1/5610545013/' + $rootScope.account + '?pin=1234').success(function(data){
        $rootScope.myData = data;

        var p = $rootScope.myData.courses;
        for (var x in p) {
          if (p.hasOwnProperty(x)) {
            for (var y in $rootScope.courseList) {
              if ($rootScope.courseList.hasOwnProperty(y)) {
                if(p[x].id == $rootScope.courseList[y].id){
                  $rootScope.courseList.splice(y, 1);
                }
              }
            }
          }
        }

      });

      
    }

    

    todoList.addCourse = function (course,sec) {
        $rootScope.courseList.splice($rootScope.courseList.indexOf(course), 1);

        var courseObj = {
          "id" : course.id,
          "sec" : sec.id,
          "date" : sec.date,
          "instructors" : sec.instructors,
          "location" : sec.location,
          "name": course.name,
          "credit": course.credit,
          "description": course.description,
        }
        console.log($rootScope.account);
        $rootScope.myData.courses.push(courseObj);

        if($rootScope.account == "5610545048")
        var sendingData = {"5610545048" : $rootScope.myData}
        else if($rootScope.account == "5610545013")
        var sendingData = {"5610545013" : $rootScope.myData}

        $http.post('http://52.37.98.127:3000/v1/5610545013?pin=1234', sendingData).success(function(data){
        //console.log(data)
        });

    }

    todoList.dropCourse = function (course) {
        $rootScope.myData.courses.splice($rootScope.myData.courses.indexOf(course), 1);


        if($rootScope.account == "5610545048")
        var sendingData = {"5610545048" : $rootScope.myData}
        else if($rootScope.account == "5610545013")
        var sendingData = {"5610545013" : $rootScope.myData}

        $http.post('http://52.37.98.127:3000/v1/5610545013?pin=1234', sendingData).success(function(data){
        //console.log(data)
        todoList.getCourse();
        });

    }

    todoList.loginAccount = function (account,password) {
      var str ;
      var pass = false;
      //console.log(account)
      if(typeof account != 'undefined' && typeof password != 'undefined')
      {
          str = account;
          $rootScope.password = password;
          var a = account.substring(1, str.length);
          $http.get('http://52.37.98.127:3000/v1/5610545013?pin=1234').success(function(data){
            $rootScope.myData = data;

          angular.forEach($rootScope.myData, function (todo) {
            //console.log(todo.stdId)
            if(todo.stdId == a ){
              $rootScope.account = a;
              todoList.getCourse();
              pass = true;
            }

          })

          if(pass)
          {
            window.location.href = '#/home';
          }
          else{
            alert("Incorrect account number, please try again...")
          }

        })

          console.log($rootScope.account + " : " + $rootScope.password);

      }
    }

    $scope.showAdvanced = function(ev,regis) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        controller: JSONController,
        templateUrl: 'src/view/dialog1.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: useFullScreen,
        locals : {x : regis}
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });

    };

    $scope.showAlert = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    // Modal dialogs should fully cover application
    // to prevent interaction outside of dial
        $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title('This is JSON')
          .textContent(JSON.stringify($rootScope.myData))
          .ariaLabel('Alert Dialog Demo')
          .ok('Got it!')
          .targetEvent(ev)
        );
  };

    $scope.showConfirm = function(ev, course) {
      // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
              .title(course.id +" : " +course.name.en)
              .textContent('Are you sure you want to drop this course?')
              .ariaLabel('Lucky day')
              .targetEvent(ev)
              .ok('Drop')
              .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
          $scope.status = todoList.dropCourse(course);
        }, function() {
          $scope.status = 'You decided to keep your debt.';
        });
      };

    $scope.showTabDialog = function(ev, course) {

        $http.get('https://whsatku.github.io/skecourses/sections/' + course.id + '.json').success(function(data){

                  $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'src/view/tabDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    locals : {x : course , y : data }
                  })
                  .then(function(answer) {
                    console.log(answer)
                    $scope.status = todoList.addCourse(course,answer);
                  }, function() {
                    $scope.status = 'You cancelled the dialog.';
                  });
        }).error(function (error, status){

        }); 

    };

    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
  $scope.toastPosition = angular.extend({},last);
  $scope.getToastPosition = function() {
    sanitizePosition();
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };
  function sanitizePosition() {
    var current = $scope.toastPosition;
    if ( current.bottom && last.top ) current.top = false;
    if ( current.top && last.bottom ) current.bottom = false;
    if ( current.right && last.left ) current.left = false;
    if ( current.left && last.right ) current.right = false;
    last = angular.extend({},current);
  }
  $scope.showCustomToast = function() {
    $mdToast.show({
      controller: 'ToastCtrl',
      templateUrl: 'toast-template.html',
      parent : $document[0].querySelector('#toastBounds'),
      hideDelay: 6000,
      position: $scope.getToastPosition()
    });
  };
  $scope.showSimpleToast = function() {
    $mdToast.show(
      $mdToast.simple()
        .textContent('Simple Toast!')
        .position($scope.getToastPosition())
        .hideDelay(3000)
    );
  };
  $scope.showActionToast = function() {
    var toast = $mdToast.simple()
          .textContent('Click OK to log out!!')
          .action('OK')
          .highlightAction(false)
          .position($scope.getToastPosition());
    $mdToast.show(toast).then(function(response) {
      if ( response == 'ok' ) {
        window.location.href = '#/login';
        $rootScope.account = "";
      }
    });
  };


  })

  .controller('ToastCtrl', function($scope, $mdToast) {
    $scope.closeToast = function() {
      $mdToast.hide();
    };
  })

  .service('TodoListService', function(){
    var todoList = this
    todoList.save = function(course){
      todoList.course = course;
    }
    todoList.get = function(){
      if(todoList.course == undefined){
        todoList.course = []
      }
      return todoList.course
    }
  })


  function DialogController($scope, $mdDialog, x , y) {
    console.log("Kuyyyydsifvpfkvpdf")
    $scope.course = x;
    $scope.sec = y;
    console.log(y);
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
    $scope.getPercent = function(enrolled,accept) {
      //console.log(enrolled/accept)
      return (enrolled/accept)*100;
    };
  }

  function JSONController($scope, $mdDialog, x) {
    $scope.regis = JSON.stringify(x,null,2);
    console.log(x);
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }

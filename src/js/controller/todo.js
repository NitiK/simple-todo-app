angular.module('todoApp', ['ui.router', 'ngMaterial'])
  .controller('TodoListController', function ($http, $rootScope, $scope, $mdDialog, TodoListService, $mdMedia) {
    var todoList = this
    todoList.todos = [
      {text: 'learn angular', done: true},
      {text: 'build an angular app', done: false}]
    todoList.regisList = TodoListService.get();

    $('.modal-trigger').leanModal();

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
        todoList.courseList = $.map(data, function(value, index) {return [value];});
      
      angular.forEach(todoList.courseList, function (todo) {
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

      $http.get('http://52.37.98.127:3000/v1/5610545013/5610545013?pin=1234').success(function(data){
        $rootScope.myData = data;

        var p = $rootScope.myData.courses;
        for (var x in p) {
          if (p.hasOwnProperty(x)) {
            for (var y in todoList.courseList) {
              if (todoList.courseList.hasOwnProperty(y)) {
                if(p[x].id == todoList.courseList[y].id){
                  todoList.courseList.splice(y, 1);
                }
              }
            }
          }
        }

      });

      
    }
    todoList.getCourse();

    

    todoList.addCourse = function (course,sec) {
        todoList.courseList.splice(todoList.courseList.indexOf(course), 1);

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
        $rootScope.myData.courses.push(courseObj);
        //console.log("kongkongkong")
        //console.log(courseObj)
        var sendingData = {"5610545013" : $rootScope.myData}

        $http.post('http://52.37.98.127:3000/v1/5610545013?pin=1234', sendingData).success(function(data){
        //console.log(data)
        });

    }

    todoList.dropCourse = function (course) {
        $rootScope.myData.courses.splice($rootScope.myData.courses.indexOf(course), 1);
        var sendingData = {"5610545013" : $rootScope.myData}
        $http.post('http://52.37.98.127:3000/v1/5610545013?pin=1234', sendingData).success(function(data){
        //console.log(data)
        todoList.getCourse();
        });

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

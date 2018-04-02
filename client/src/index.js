import angular from 'angular';
import ngRoute from 'angular-route';
import 'bootstrap/dist/css/bootstrap.min.css';
import io from 'socket.io-client';

import {pos} from './game/modules/animation.js';
import {animation} from './game/modules/animation.js';
import {objCanvas} from './game/modules/animation.js';
import {ctx} from './game/modules/animation.js';

/* ---------- GLOBALES ---------- */

export var castorsArray = [];
export var map;
export var myCastor = {
  posX: 0,
  posY: 0
}
var castorName;
/* ---------- FIN GLOBALES ---------- */


(function(window, io) {
const socketIo = io('http://localhost:8080/');


/* ---------- ROUTE ---------- */
angular.module('route-app', []);

/* ---------- HOMEPAGE ---------- */
angular.module('routeAppControllers',[])
.controller('homeCtrl', [
  '$scope',
  '$location',
  '$interval',
  function($scope, $location, $interval){
    $scope.go = function (path){
      $location.path(path);
    }
    $scope.$on('$viewContentLoaded', function(){
      var count = 0;
      $scope.count= count;
      $interval(function(){
         $scope.count = count;
      }, 500);
      $scope.valid = function(){
        if (count < 2) {
          return true;
        } else {
          return false;
        }
      };

      socketIo.on('listPlayer', function(arr){
        arr.forEach(function(player){
          count += 1;
          var li = document.createElement("li");
          li.className = 'list-group-item';
          li.textContent = player.name;
          li.setAttribute("id", player);
          document.getElementById('liste-salon').appendChild(li);
        });
      });

      socketIo.on('newPlayer', function(name){
        count += 1;
        var li = document.createElement("li");
        li.className = 'list-group-item';
        li.textContent = name;
        li.setAttribute("id", name);
        document.getElementById('liste-salon').appendChild(li);
      });

      socketIo.on('removePlayer', function(player){
        document.getElementById(player.name).remove();
      });

      document.getElementById('login').addEventListener('submit', function(e){
        e.preventDefault();
        castorName = document.getElementById('loginCastor').value;
        socketIo.emit('createCastor', {name: castorName});
        document.getElementById('login').remove();
      });
      document.getElementById('playGame').addEventListener('click', function(e){
        e.preventDefault();
        socketIo.emit('launchGame');
      })
      socketIo.on('forceLocation', () => {
          $location.path('/game');
      })

    });
  }
])
/* ---------- GAME ---------- */
.controller('gameCtrl', [ // game ctrl
  '$scope',
  '$route',
  function($scope, $route){
    $scope.$on('$viewContentLoaded', function(){
    //  const socket = io('/game');
      socketIo.emit('startGame', 'coucou');
      socketIo.on('sendMap', function(array){

    //    window.location = '#/game';
        objCanvas.getCanvas();
        array.forEach(function(b){
          pos.calculPosition(b);
        })
        map = array;
        animation(33);
      });
    });

    socketIo.on('returnCreate', function(msg){
      castorsArray.push(msg);
      myCastor = msg;
    });

    socketIo.on('monteeDesEaux', function(array){
      array.forEach(function(b){
        pos.calculPosition(b);
      })
      map = array;
    })
    socketIo.on('positionMyCastor', function(obj){
      pos.calculPosition(obj);
      myCastor = obj;
    })

      window.addEventListener('keydown', function(event){
        var code = event.code;
        if (code === 'ArrowRight' || code === 'ArrowLeft' || code === 'ArrowUp' || code === 'ArrowDown' || code === 'ControlLeft'){
          event.preventDefault();
        }
        switch (code){
          case 'ArrowRight':
              socketIo.emit('moveCastor', 'ArrowRight');
              break;
          case 'ArrowLeft':
              socketIo.emit('moveCastor', 'ArrowLeft');
          break;
          case 'ArrowUp':
              socketIo.emit('moveCastor', 'ArrowUp');
              break;
          case 'ArrowDown':
              socketIo.emit('moveCastor', 'ArrowDown');
          break;
          case 'ControlLeft':
              socketIo.emit('moveCastor', 'ControlLeft');
          break;
        }
      });

      socketIo.on('updateCastors', function(array){
        array.forEach(function(c){
          pos.calculPosition(c);
        })
        castorsArray = array;

      })
      socketIo.on('positionBarrage', function(array){
        array.forEach(function(b){
          pos.calculPosition(b);
        })
        map = array;
      })


      socketIo.on('createOtherCastor', function(msg){
        castorsArray.push(msg);
      })

      document.getElementById('restart').addEventListener('click', function(){
        socketIo.emit('restart', 'rejoue');
      })
//fin socket
}]);


  require('./components/route-app.js')
  angular.bootstrap(window.document, ['app'], {strictDi: true});

}(window, io));

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
var host;
var playerArray = [];

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
  '$http',
  function($scope, $location, $interval, $http){
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
      if (host === 'host'){
        console.log('host actif');
        if (count < 2) {
          return true;
        } else {
          return false;
          console.log('bouton actif');
        }
      } else {
        return true;
      }
      };

      $scope.checkName = function(){
        playerArray.forEach(function(p){
          if ($scope.nom === p.name){
            $scope.trouveunautrenom = true;
          } else {
            $scope.trouveunautrenom = false;
          }
        })
      }

      socketIo.on('listPlayer', function(arr){
        playerArray = arr;
        arr.forEach(function(player){
          count += 1;
          console.log(count);
          var li = document.createElement("li");
          li.className = 'list-group-item';
          li.textContent = player.name;
          li.setAttribute("id", player.name);
          document.getElementById('liste-salon').appendChild(li);
        });
      });
      socketIo.on('host', function(){
        host = 'host';
      })

      socketIo.on('newPlayer', function(name){
        console.log(name)
        count += 1;
        var li = document.createElement("li");
        li.className = 'list-group-item';
        li.textContent = name;
        li.setAttribute("id", name);
        document.getElementById('liste-salon').appendChild(li);
      });

      socketIo.on('removePlayer', function(player){
      count -= 1;
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
  '$location',
  function($scope, $route, $location){
    $scope.$on('$viewContentLoaded', function(){
    //  const socket = io('/game');
      socketIo.emit('startGame', host);
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
        if(b.type === 5){
          socketIo.emit('finishGame', 'end');
          $location.path('/end');
        }
        pos.calculPosition(b);
      })
      map = array;
    })
    socketIo.on('positionMyCastor', function(obj){
      pos.calculPosition(obj);
      myCastor = obj;
    })

    var touche;
      window.addEventListener('keydown', function(event){
        var code = event.code;
        if (code === 'ArrowRight' || code === 'ArrowLeft' || code === 'ArrowUp' || code === 'ArrowDown' || code === 'ControlLeft'){
          event.preventDefault();
        }
        if (touche !== 'move'){
          switch (code){
            case 'ArrowRight':
            touche = 'move';
            socketIo.emit('moveCastor', 'ArrowRight');
            break;
            case 'ArrowLeft':
             touche = 'move';
            socketIo.emit('moveCastor', 'ArrowLeft');
            break;
            case 'ArrowUp':
             touche = 'move';
            socketIo.emit('moveCastor', 'ArrowUp');
            break;
            case 'ArrowDown':
             touche = 'move';
            socketIo.emit('moveCastor', 'ArrowDown');
            break;
            case 'ControlLeft':
             touche = 'move';
            socketIo.emit('moveCastor', 'ControlLeft');
            break;
          }
        }
      });
      window.addEventListener('keyup', function(){
        touche = '';
      })

      socketIo.on('updateCastors', function(array){
        playerArray = array;
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
}])
.controller('endCtrl', [ // game ctrl
  '$scope',
  '$route',
  '$location',
  function($scope, $route, $location){
    $scope.$on('$viewContentLoaded', function(){

      document.getElementById('replay').addEventListener('click', function(e){
        e.preventDefault();
        $location.path('/home');
      });

    })
  }]);


  require('./components/route-app.js')
  angular.bootstrap(window.document, ['app'], {strictDi: true});

}(window, io));

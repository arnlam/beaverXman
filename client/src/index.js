import angular from 'angular';
import ngRoute from 'angular-route';
import 'bootstrap/dist/css/bootstrap.min.css';
import io from 'socket.io-client';

(function(window, io) {
const socketIo = io('http://localhost:8080/');
var castorName;

angular.module('app', ['ngRoute', 'routeAppControllers'])
  .config(['$routeProvider',
    function($routeProvider){
      $routeProvider
      .when('/home', {
        templateUrl: './views/login.html',
        controller: 'homeCtrl'
      })
      .when('/game', {
        templateUrl: './views/canvas.html',
        controller: 'gameCtrl'
      })
      .otherwise({
           redirectTo: '/home'
      })
    }
  ]);
  angular.module('routeAppControllers',[])
  .controller('homeCtrl', [
    '$scope',
    '$location',
    function($scope, $location){
      $scope.go = function (path){
        $location.path(path);
      }
      $scope.$on('$viewContentLoaded', function(){

          document.getElementById('login').addEventListener('submit', function(e){
            console.log('hoo')
            e.preventDefault();
            castorName = document.getElementById('loginCastor').value;
            socketIo.emit('createCastor', {name: castorName});
          });
        });

  }])
    .controller('gameCtrl', [
      '$scope',
      '$route',
      function($scope, $route){
        $scope.$on('$viewContentLoaded', function(){
              var canvas = document.getElementById('canvas');
              var ctx = canvas.getContext('2d');
              canvas.width = 1000;
              canvas.height = 800;

              const castorImg = new Image();
              castorImg.src = 'docs/img/castor.png';
              const castorSwimImg = new Image();
              castorSwimImg.src = 'docs/img/castorswim.png';
              const blockImg = new Image();
              blockImg.src = 'docs/img/block.jpg';
              const rockImg = new Image();
              rockImg.src = 'docs/img/rock.png';
              const waterImg = new Image();
              waterImg.src = 'docs/img/water.jpg';
              const barrageImg = new Image();
              barrageImg.src = 'docs/img/barrage.jpg';

              var largeurBlock = 100;
              var hauteurBlock = 100;

              var draw = function(obj, img){
                ctx.drawImage(
                  img,
                  obj.spriteX, // position X sur l'img source
                  obj.spriteY, // position Y sur l'img source
                  obj.width, // Largeur de l'img source
                  obj.height, // hauteur de l'img source
                  obj.posX, // position X sur le canvas
                  obj.posY, // position Y sur le canvas
                  obj.widthC, // largeur sur le canvas
                  obj.heightC // hauteur sur le canvas
                );
              };
              var calculPosition = function(b){
                b.widthC = largeurBlock;
                b.heightC = hauteurBlock
                b.posX = (b.positionX)*largeurBlock;
                b.posY = (b.positionY)*hauteurBlock;
              }

              var myCastor = {
                posX: 0,
                posY:0
              }
              var checkPositionX = function(){
                if(myCastor.posX >= 3*largeurBlock){
                  return -myCastor.posX + (largeurBlock*3)
                } else {
                  return 0
                }
              }
              var checkPositionY = function(){
                if(myCastor.posY >= 3*hauteurBlock){
                  return -myCastor.posY + (hauteurBlock*3)
                } else {
                  return 0
                }
              }
            var clearCanvas = function(){
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            };
            var animation = function(period){
                var initialTimestamp;
                var nextRefresh = function(timestamp){
                    if (initialTimestamp === undefined) {
                      initialTimestamp = timestamp;
                    } else {
                      var decay = timestamp - initialTimestamp;
                      if (decay >= period) {
                        initialTimestamp = timestamp;
                        clearCanvas();
                        ctx.save();

                          ctx.translate(checkPositionX(), checkPositionY())

                        if (map){
                          map.forEach(function(b){
                            if (b.type === 0){
                              draw(b, blockImg);
                            } else if(b.type === 2){
                              draw(b, waterImg);
                            } else if(b.type === 3){
                                draw(b, barrageImg);
                                } else {
                              draw(b, rockImg);
                            }
                          })
                        }
                        castorsArray.forEach(function(c){
                          if (c.option === 'swim'){
                            draw(c, castorSwimImg);
                          } else {
                            draw(c, castorImg);
                          }
                          ctx.font = '15px sans-serif';
                          ctx.fillText(c.name, c.posX, c.posY);
                        })
                        ctx.restore();
                      }
                    }
                    window.requestAnimationFrame(nextRefresh);
                };
                nextRefresh(0);
              };

                animation(33)





            var castorsArray = [];
            var map;

            socketIo.emit('hello', 'coucou');


            socketIo.on('returnCreate', function(msg){
              castorsArray.push(msg);
              myCastor = msg;
            });
            socketIo.on('sendMap', function(array){
              array.forEach(function(b){
                calculPosition(b);
              })
              map = array;
            })
            socketIo.on('monteeDesEaux', function(array){
              array.forEach(function(b){
                calculPosition(b);
              })
              map = array;
            })
            socketIo.on('positionMyCastor', function(obj){
              calculPosition(obj)
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
                  console.log('hhaa')
                      socketIo.emit('moveCastor', 'ControlLeft');
                  break;
                }
              });

              socketIo.on('updateCastors', function(array){
                array.forEach(function(c){
                  calculPosition(c);
                })
                castorsArray = array;

              })
              socketIo.on('positionBarrage', function(array){
                array.forEach(function(b){
                  calculPosition(b);
                })
                map = array;
              })


              socketIo.on('createOtherCastor', function(msg){
                castorsArray.push(msg);
              })


//fin socket
        });
    }]);

/*
  .directive('myCanvas', function(){
    return {
      restrict: 'E',
      templateUrl: './views/canvas.html'
    }
  })*/
  angular.bootstrap(window.document, ['app'], {strictDi: true});

}(window, io)); // IIFE

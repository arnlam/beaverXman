const express = require('express')
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server, { wsEngine: 'ws' });
var _ = require('lodash');


app.use('/docs', express.static( path.resolve('../client/assets')));
app.use('/views', express.static( path.resolve('../client/public/views')));

app.get('/', function(req, res){
  res.sendFile( path.resolve('../client/public/index.html'));
});

const ConstrCastor = function(name){
  this.name = name;
  this.spriteX = 0;
  this.spriteY = 0;
  this.width = 390;
  this.height = 372;
  this.posX = 0;
  this.posY = 0;
  this.widthC = 195;
  this.heightC = 186;
  this.positionX = 0; // pour transformation
  this.positionY = 0; // pour transformation
}
ConstrCastor.prototype.getCoordCastor = function(){
  return {
    posX: this.posX,
    posY: this.posY,
    id: this.id

  }
}

const map = [
            [0,0,0,0,0,0,0,1,0,0,0,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,1,1,0,1,0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,1,1,0,1,0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,1,0,0,0,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [2,0,0,1,1,0,1,0,0,0,1,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [0,0,0,0,0,0,0,0,0,0,1,0,0,0],
            [0,2,2,2,0,0,0,2,2,2,0,0,0,0]
            ]
const Block = function(typeBlock){
  this.spriteX = 0;
  this.spriteY = 0;
  this.width = 256;
  this.height = 256;
  this.posX = 0;
  this.posY = 0;
  this.widthC = 0;
  this.heightC = 0;
  this.positionX = 0; // pour transformation
  this.positionY = 0; // pour transformation
  this.type = 0;
}

var blockArray = [];
const createMap = function(){
  for (var i=0; i<map.length; i++ ){
    for (var j= 0; j<map[i].length; j++){
      let block = new Block();
      block.positionX = j;
      block.positionY = i;
      block.type = map[i][j];
      blockArray.push(block);
    }
  }
};


const getCasesMitoyennes = function(array, x, y){
  let waterCount = 0;
  let retentionCount = 0;
  if (typeof array[x+1] !== 'undefined'){
    if (array[x+1] === (1 || 3 ) ){
      retentionCount++
    } else if (array[x+1][y] === 2) {
      waterCount++;
    }
  }
  if (typeof array[x-1] !== 'undefined'){
    if (array[x-1][y] === (1 || 3 ) ){
      retentionCount++
    } else if (array[x-1][y] === 2) {
      waterCount++;
    }
  }
  if (typeof array[x][y+1] !== 'undefined'){
    if (array[x][y+1] === (1 || 3 ) ){
      retentionCount++
    } else if (array[x][y+1] === 2) {
      waterCount++;
    }
  }
  if (typeof array[x][y-1] !== 'undefined'){
    if (array[x][y-1] === (1 || 3 ) ){
      retentionCount++
    } else if (array[x][y-1] === 2) {
      waterCount++;
    }
  }
  return [waterCount, retentionCount];
};

const calculMonteedesEaux = function(){
//  let blockArrayTemp = [];
  for (let i=0; i<map.length; i++ ){
    for (let j= 0; j<map[i].length; j++){
      if(map[i][j] === 0){
        let counts = getCasesMitoyennes(map, i, j);
        if(counts[0] >= 1){
          let block = new Block();
          block.positionY = i;
          block.positionX = j;
          block.type = 2;
          map[i][j] = 2;
          let index = _.findIndex(blockArray, {positionY: i, positionX: j});
          blockArray.splice(index, 1, block);
        }
      }
    }
  }
}



const calculCollisionX = function(castor, nbr){
  if (typeof map[castor.positionY][castor.positionX+nbr] === 'undefined'){
    console.log('boom')
  } else if (map[castor.positionY][castor.positionX+nbr] === 1){
      console.log('boom')
    } else if (map[castor.positionY][castor.positionX+nbr] === 2){
      castor.positionX += nbr;
      castor.option = 'swim';
    } else {
      castor.positionX += nbr;
      castor.option = '';
    }
};

const calculCollisionY = function(castor, nbr){
  if (typeof map[castor.positionY+nbr] === 'undefined'){
    console.log('boom')
  } else if (map[castor.positionY+nbr][castor.positionX] === 1){
      console.log('boom')
    } else if(map[castor.positionY+nbr][castor.positionX] === 2) {
      castor.positionY += nbr
      castor.option = 'swim';
    } else {
      castor.positionY += nbr
      castor.option = '';
    }
};
const calculCollisionBarrage = function(castor){
  if (map[castor.positionY][castor.positionX] === 0 || map[castor.positionY][castor.positionX] === 3){
    // retrouver le block
    let index = _.findIndex(blockArray, {positionY:castor.positionY, positionX: castor.positionX });
    let block = new Block();
    block.positionY = castor.positionY;
    block.positionX = castor.positionX;
    if (map[castor.positionY][castor.positionX] === 0){
      map[castor.positionY][castor.positionX] = 3;
      block.type = 3;
    } else {
      map[castor.positionY][castor.positionX] = 0;
      block.type = 0;
    }
    blockArray.splice(index, 1, block);
  }
}

var barrageArray =[];
var castors = {};
var i = 0;
io.on('connection', (socket) => {
  castorsArray = Object.keys(castors).map(key => castors[key]);
  socket.on('createCastor', (msg) => {
    console.log(msg)
    i++;
  //  io.emit('returnCreate', myCastor)
    var myCastor = new ConstrCastor(msg.name);
    castors[socket.id] = myCastor;
    var castorsArray = Object.keys(castors).map(prop => castors[prop])
  });
  socket.on('hello', (hello) =>{
    io.emit('updateCastors', castorsArray);
    createMap();
    io.emit('sendMap', blockArray)
    //  castors[msg.name]
    //  var castorsArray = Object.keys(castors).map(prop => castors[prop]);
    global.setInterval(function(){
      calculMonteedesEaux();
      socket.emit('monteeDesEaux', blockArray);
    },4000);
  });

  socket.on('moveCastor', function(move){
    if(castors[socket.id]){
      var myCastor = castors[socket.id]
      switch (move) {
        case 'ArrowRight': calculCollisionX(myCastor, 1)
              socket.emit('positionMyCastor', myCastor)
          break;
        case 'ArrowLeft':  calculCollisionX(myCastor,-1)
              socket.emit('positionMyCastor', myCastor)
          break;
        case 'ArrowUp':  calculCollisionY(myCastor,-1)
              socket.emit('positionMyCastor', myCastor)
          break;
        case 'ArrowDown':  calculCollisionY(myCastor, 1)
              socket.emit('positionMyCastor', myCastor)
          break;
        case 'ControlLeft':  calculCollisionBarrage(myCastor)
              socket.emit('positionBarrage', blockArray)
          break;
      }
      var castorsArray = Object.keys(castors).map(prop => castors[prop])
      io.emit('updateCastors', castorsArray);
    }
  });
});

server.listen(8080, function(){
  console.log('serveur démarré');
});

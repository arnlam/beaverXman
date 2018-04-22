const express = require('express'),
  app = express(),
  path = require('path'),
  server = require('http').Server(app),
  io = require('socket.io')(server, { wsEngine: 'ws' }),
  _ = require('lodash'),
  config = require('./config/config'),
  expressMongoDb = require('express-mongo-db'),
  session = require('express-session'),
  MongoStore = require('connect-mongodb-session')(session);
  mongo = require('mongodb').MongoClient;


app.use('/docs', express.static(path.resolve('../client/assets')));
app.use('/views', express.static(path.resolve('../client/public/views')));

app.use(expressMongoDb(config.mongoURL));

app.use(session({
  secret: 'adfzgtrnhjyh',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  },
  store: new MongoStore({
    uri: config.mongoURL,
    collection: 'sessions'
  })
}));

app.get('/', function(req, res){
  res.sendFile( path.resolve('../client/public/index.html'));
});

// app.get('/scores', (req, res) =>{
//    req.db.collection('sessions').find({}).toArray((err, doc)=>{
//
//    })
// })

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
  this.score = 0;
  this.resultat = '';
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
            [0,0,0,1,1,0,1,0,0,0,1,0,0,0],
            [0,0,0,0,3,0,0,3,0,0,0,0,0,0],
            [0,0,0,3,3,3,3,3,0,0,1,0,0,0],
            [0,2,2,2,0,0,0,2,2,2,0,0,0,0]
          ];


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

const createMap = function(){
  map_ = JSON.parse(JSON.stringify(map));
  castorsArray.forEach((castor)=>{
    let choucroute = Math.floor(Math.random()*14);
    while(typeof map_[0][choucroute] == 'string'){
      choucroute = Math.floor(Math.random()*14);
    }
    map_[0][choucroute] = castor.terrier;
  })
  for (var i=0; i<map_.length; i++ ){
    for (var j= 0; j<map_[i].length; j++){
      let block = new Block();
      block.positionX = j;
      block.positionY = i;
      block.type = map_[i][j];
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
  for (let i=0; i<map_.length; i++ ){
    for (let j= 0; j<map_[i].length; j++){
      if(map_[i][j] === 0){
        let counts = getCasesMitoyennes(map_, i, j);
        if(counts[0] >= 1){
          let block = new Block();
          block.positionY = i;
          block.positionX = j;
          block.type = 2;
          map_[i][j] = 2;
          let index = _.findIndex(blockArray, {positionY: i, positionX: j});
          blockArray.splice(index, 1, block);
        }
      } else if (typeof map_[i][j] == 'string'){
        let counts = getCasesMitoyennes(map_, i, j);
        if(counts[0] >= 1){
          let block = new Block();
          block.positionY = i;
          block.positionX = j;
          block.type = 5;
          block.castorHouse = map_[i][j];
          castorsArray[Number(parseInt(block.castorHouse))].resultat = 'perdu';
          map_[i][j] = 5;
          let index = _.findIndex(blockArray, {positionY: i, positionX: j});
          blockArray.splice(index, 1, block);

        }
      }
    }
  }
}



const calculCollisionX = function(castor, nbr){
  if (typeof map_[castor.positionY][castor.positionX+nbr] === 'undefined'){
  } else if (map_[castor.positionY][castor.positionX+nbr] === 1){
    } else if (map_[castor.positionY][castor.positionX+nbr] === 2){
      castor.positionX += nbr;
      castor.option = 'swim';
      } else {
        castor.positionX += nbr;
        castor.option = '';
    }
};

const calculCollisionY = function(castor, nbr){
  if (typeof map_[castor.positionY+nbr] === 'undefined'){
  } else if (map_[castor.positionY+nbr][castor.positionX] === 1){
    } else if(map_[castor.positionY+nbr][castor.positionX] === 2) {
        castor.positionY += nbr
        castor.option = 'swim';
        } else {
          castor.positionY += nbr
          castor.option = '';
        }
};
const calculCollisionBarrage = function(castor){
  if (map_[castor.positionY][castor.positionX] === 0 || map_[castor.positionY][castor.positionX] === 3){
    // retrouver le block
    let index = _.findIndex(blockArray, {positionY:castor.positionY, positionX: castor.positionX });
    let block = new Block();
    block.positionY = castor.positionY;
    block.positionX = castor.positionX;
    if (map_[castor.positionY][castor.positionX] === 0){
      map_[castor.positionY][castor.positionX] = 3;
      block.type = 3;
    } else {
      map_[castor.positionY][castor.positionX] = 0;
      block.type = 0;
      castor.score += 50;
    }
    blockArray.splice(index, 1, block);
  }
}



const purge = () => {
  blockArray = [];
  map_ = '';
  barrageArray =[];
}
/* GLOBALES */
var playerArray = [],
blockArray = [],
map_,
barrageArray =[],
castors = {},
castorsArray = [];

/*-------- CONNECTION AU SITE ----------*/
io.on('connection', (socket) => {
/*-------- CONNECTION AU SALON ----------*/
  socket.join('salon');
  castorsArray = Object.keys(castors).map(prop => castors[prop])
  io.emit('updateCastors', castorsArray);
  socket.emit('listPlayer', playerArray);
/*-------- LOGIN ----------*/
  socket.on('createCastor', (msg) => {
    console.log('aahhh')
    var myCastor = new ConstrCastor(msg.name);
    let player = {name: msg.name, id: socket.id}
    playerArray.push(player);
    myCastor.terrier = _.findIndex(playerArray, {name: msg.name }) + 'T';
    console.log('playerArray :' + playerArray)
    castors[socket.id] = myCastor;
    myCastor.socket = socket.id;
    // Ajoute joueur entrant
    io.to('salon').emit('newPlayer', msg.name);
    console.log('length ' + playerArray.length);
    if (playerArray.length === 1){
      socket.emit('host', 'host');
    }
  });
/*-------- LOGOUT ----------*/
  socket.on('disconnect', () => {
    console.log('disconnect');
    let index = _.findIndex(playerArray, {id: socket.id});
    let player = playerArray[index];
    if (index !== -1){
      console.log(player);
      io.to('salon').emit('removePlayer', player);
      playerArray.splice(index, 1);
      console.log(playerArray.length);
      if (playerArray.length === 1){
        io.emit('host', 'host');
      } // renvoyer le host à la dernière personne
      if (playerArray.length === 0){
        if(typeof intervalWater !== 'undefined'){
          global.clearInterval(intervalWater);
        }
        purge();
       }
      castorsArray = Object.keys(castors).map(prop => castors[prop]);
      io.emit('updateCastors', castorsArray);
    }
    if(castors[socket.id]){
      delete castors[socket.id]
    }
    // if(castors === {}){
    //   blockArray = [];
    //   barrageArray =[];
    // }
  });
/*-------- LANCEMENT JEU ET FORCER AFFICHAGE ----------*/
  socket.on('launchGame', () =>{
    castorsArray = Object.keys(castors).map(prop => castors[prop])
    console.log(castorsArray)
    createMap();
    io.emit('forceLocation', 'go');
  });

  socket.on('startGame', (hosted) =>{
    io.emit('sendMap', blockArray);
    castorsArray = Object.keys(castors).map(prop => castors[prop])
    // console.log(castorsArray);
    io.emit('updateCastors', castorsArray);
    if (typeof intervalWater == 'undefined' && hosted === 'host'){
      var intervalWater = global.setInterval(function(){
        console.log('ça monte');
        calculMonteedesEaux();
        io.emit('monteeDesEaux', blockArray);
      },200);
    }
  });

  socket.on('moveCastor', function(move){
    if(castors[socket.id]){
      let myCastor = castors[socket.id];
      switch (move) {
        case 'ArrowRight': calculCollisionX(myCastor, 1);
              socket.emit('positionMyCastor', myCastor);
          break;
        case 'ArrowLeft':  calculCollisionX(myCastor,-1);
              socket.emit('positionMyCastor', myCastor);
          break;
        case 'ArrowUp':  calculCollisionY(myCastor,-1);
              socket.emit('positionMyCastor', myCastor);
          break;
        case 'ArrowDown':  calculCollisionY(myCastor, 1);
              socket.emit('positionMyCastor', myCastor);
          break;
        case 'ControlLeft':  calculCollisionBarrage(myCastor);
              io.emit('positionBarrage', blockArray);
          break;
      }
      castorsArray = Object.keys(castors).map(prop => castors[prop]);
      io.emit('updateCastors', castorsArray);
    }
  });

  socket.on('finishGame', (winner)=>{
    castorsArray = Object.keys(castors).map(prop => castors[prop]);
    let index = _.findIndex(castorsArray, {socket: socket.id});
    let player = castorsArray[index];

    if (index !== -1){
      if(castorsArray[index].resultat !== 'perdu'){
        castorsArray[index].score += 10000;
      }
      mongo.connect(config.mongoURL, function(err, db){
        db.collection('castors').insertOne(player);
      });
    }
  });


  socket.on('restart', ()=> {
    if(typeof intervalWater !== 'undefined'){
      global.clearInterval(intervalWater);
    }
    purge();
    castorsArray = Object.keys(castors).map(prop => castors[prop])
    createMap();
    io.emit('sendMap', blockArray);
    io.emit('updateCastors', castorsArray);
    console.log('ça monte');
    var intervalWater = global.setInterval(function(){
      calculMonteedesEaux();
      io.emit('monteeDesEaux', blockArray);
    },8000);
  })
});

server.listen(config.port, function(){
  console.log('serveur démarré');
});

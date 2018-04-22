import {map} from '../../index.js';
import {myCastor} from '../../index.js';
import {castorsArray} from '../../index.js';

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
const terrierImg = new Image();
terrierImg.src = 'docs/img/terrier.jpg';

const largeurBlock = 100;
const hauteurBlock = 100;
var canvas;
var ctx;

export var pos = {
  calculPosition: function(b){
    b.widthC = largeurBlock;
    b.heightC = hauteurBlock,
    b.posX = (b.positionX)*largeurBlock;
    b.posY = (b.positionY)*hauteurBlock;
  },

  checkPositionX: function(){
    if (myCastor.posX >= 10*largeurBlock){
      return -largeurBlock*6;
    } else if (myCastor.posX >= 3*largeurBlock){
      return -myCastor.posX + (largeurBlock*3)
    } else {
      return 0;
    }
  },
  checkPositionY: function(){
    if (myCastor.posY >= 10*largeurBlock){
      return -hauteurBlock*6;
    } else if (myCastor.posY >= 3*hauteurBlock){
      return -myCastor.posY + (hauteurBlock*3)
    } else {
      return 0
    }
  }
};

export const objCanvas = {
    getCanvas: function(){
      canvas = document.getElementById('canvas');
      ctx = canvas.getContext('2d');
      canvas.width = 1000;
      canvas.height = 800;
    },
    draw: function(obj, img){
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
    },
    clearCanvas: function(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };


export const animation = function(period){
  let initialTimestamp;
  let nextRefresh = function(timestamp){
      if (initialTimestamp === undefined) {
        initialTimestamp = timestamp;
      } else {
        let decay = timestamp - initialTimestamp;
        if (decay >= period) {
          initialTimestamp = timestamp;
          objCanvas.clearCanvas();
          ctx.fillStyle = 'white';
          ctx.font = '20px sans-serif';
          ctx.save();
          ctx.translate(pos.checkPositionX(), pos.checkPositionY())
          if (map){
            map.forEach(function(b){
               if (b.type === 0){
                objCanvas.draw(b, blockImg);
              } else if(b.type === 2){
                objCanvas.draw(b, waterImg);
              } else if(b.type === 3){
                  objCanvas.draw(b, barrageImg);
              } else if (b.type === 1 ) {
                objCanvas.draw(b, rockImg);
              } else {
                objCanvas.draw(b, terrierImg);
                if (b.type !== 5){
                  ctx.fillText(castorsArray[Number(parseInt(b.type))].name, b.posX+10, b.posY+20);
                }
              }
            });
          }
          castorsArray.forEach(function(c){
            if (c.option === 'swim'){
              objCanvas.draw(c, castorSwimImg);
            } else {
              objCanvas.draw(c, castorImg);
            }
            ctx.fillText(c.name, c.posX, c.posY);
          });
          ctx.restore();
          castorsArray.forEach(function(c, index, array){
              ctx.strokeText(c.name + ' : ' + c.score , 300 + index*150, 50);
          });
          // for(let i = 0; castorsArray < i ; i++){
          //   if(index=== 0){
          //     ctx.strokeText(castorsArray[i].name + ' : ' + castorsArray[i].score, 300, 50);
          //   } else {
          //     ctx.strokeText(castorsArray[i].name + ' : ' + castorsArray[i].score, 300 + castorsArray[i-1].name*20 + index*100, 50);
          //   }
          // }
          // castorsArray.forEach(function(c, index, array){
          //
          //
          // });
        }
      }
      window.requestAnimationFrame(nextRefresh);
  };
  nextRefresh(0);
};

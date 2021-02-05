"use strict"

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var shispace = {x:canvas.width/2,y:canvas.height-75,width:50,height:50,state:'alive',counter:0}
var game = {state:'init'};
var replyText = {counter:-1,title:'',subtitle:''};
var keyboard = {};
var shots = [];
var enemyShots = [];
var enemies = [];
var fondo;


function loadMedia(){
    fondo = new Image();
    fondo.src = '../resources/space2.jpeg';
    fondo.onload = function(){
        var intervalo = window.setInterval(frameLoop,1000/55);
    }
}

function drawEnemies(){
    for(let i in enemies){
        let enemy = enemies[i];

        ctx.save();

        if(enemy.state == 'alive') ctx.fillStyle = 'red';
        if(enemy.state == 'dead') ctx.fillStyle = 'black';

        ctx.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);
    }
}

function drawBackground(){
    ctx.drawImage(fondo,0,0);
}

function drawShispace(){
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillRect(shispace.x,shispace.y,shispace.width,shispace.height);
    ctx.restore();
}

function addKeyboardEvents(){

    addEvent(document,'keydown',function(e){
        keyboard[e.keyCode] = true;
    });

    addEvent(document,'keyup',function(e){
        keyboard[e.keyCode] = false;
    });

    function addEvent(element,eventName,addFunction){
        if(element.addEventListener){
            element.addEventListener(eventName,addFunction,false);
        }else if(element.attachEvent){
            element.attachEvent(eventName,addFunction);
        }
    }
}

function moveSpaceship(){

    if(shispace.state == 'hit'){
        shispace.counter++;
        if(shispace.counter >= 20){
           shispace.counter = 0;
           shispace.state = 'dead'; 
           game.state = 'lost';
           replyText.title = 'Game Over';
           replyText.subtitle = 'press R key to reboot';
           replyText.counter = 0;
        }

    }else if(shispace.state == 'alive'){

        if(keyboard[37]){
            shispace.x -= 7;
            if(shispace.x < 0) shispace.x = 0;
        }
    
        if(keyboard[39]){
            let limit = canvas.width - shispace.width;
            shispace.x += 7;
            if(shispace.x > limit) shispace.x = limit;
        }
    
        if(keyboard[32]){
            if(!keyboard.fire){
                fire();
                keyboard.fire = true;
            }
        }else{
            keyboard.fire = false;
        }
    }

}

function moveShooting(){
    for(let i in shots){
        let shot = shots[i];
        shot.y -= 2;
    }

    shots = shots.filter(function(shot){
        return shot.y > 0;
    });
}

function fire(){
    shots.push({x:shispace.x + 20, y:shispace.y - 10,width:10,height:30});
}

function drawShot(){
    ctx.save();
    ctx.fillStyle = 'white';

    for(let i in shots){
        let shot = shots[i];
        ctx.fillRect(shot.x,shot.y,shot.width,shot.height);
    }

    ctx.restore();
}

function upgradeEnemies(){

    function addEnemyShot(enemy){
        return {x: enemy.x, y: enemy.y, width:10, height:30, counter: 0};
    }

    if(game.state == 'init'){
        for(let i = 0; i < 10; i++){
            enemies.push({x:10+(i*50),y:10,width:40,height:40,state:'alive',counter:0});
        }
        game.state = 'playing';
    }

    for(let i in enemies){
        let enemy = enemies[i];
        if(!enemy) continue;
        if(enemy && enemy.state =='alive'){
            enemy.counter++;
            enemy.x += Math.sin(enemy.counter * Math.PI/90)*5;

            if(random(0,enemies.length*10) == 4){
                enemyShots.push(addEnemyShot(enemy));
            }

        }

        if(enemy && enemy.state == 'hit'){
            enemy.counter++;
            if(enemy.counter >= 20){
                enemy.state = 'dead';
                enemy.counter = 0;
            }
        }

    }

    enemies = enemies.filter(function(enemy){
        if(enemy && enemy.state != 'dead') return true;
        return false;
    });

}

function random(lower,higher){
    let possibilities = higher - lower;
    let randomNumber = Math.random() * possibilities;
    randomNumber = Math.floor(randomNumber);
    return parseInt(lower) + randomNumber;
}

function hit(shot,enemy){
    let hit = false;

    if(enemy.x + enemy.width >= shot.x && enemy.x < shot.x + shot.width){
        if(enemy.y + enemy.height >= shot.y && enemy.y < shot.y + shot.height){
            hit = true;
        }
    }

    if(enemy.x <= shot.x && enemy.x + enemy.width >= shot.x + shot.width){
        if(enemy.y <= shot.y && enemy.y + enemy.height >= shot.y + shot.height){
            hit = true;
        }
    }

    if(shot.x <= enemy.x && shot.x + shot.width >= enemy.x + enemy.width){
        if(shot.y <= enemy.y && shot.y + shot.height >= enemy.y + enemy.height){
            hit = true;
        }
    }

    return hit;
}

function verifyContact(){
    for(let i in shots){
        let shot = shots[i];
        for(let j in enemies){
            let enemy = enemies[j];
            if(hit(shot,enemy)){
                enemy.state = 'hit';
                enemy.counter = 0;
            }
        }
    }

    if(shispace.state == 'hit' || shispace.state == 'dead') return;

    for(let i in enemyShots){
        let shot = enemyShots[i];
        if(hit(shot,shispace)){
            shispace.state = 'hit';
        }
    }

}

function drawEnemyShots(){
    ctx.save();
    ctx.fillStyle = 'yellow';

    for(let i in enemyShots){
        let shot = enemyShots[i];
        ctx.fillRect(shot.x,shot.y,shot.width,shot.height);
    }
    ctx.restore();
}

function moveEnemyShots(){
    for(let i in enemyShots){
        let shot = enemyShots[i];
        shot.y += 3;
    }
    enemyShots = enemyShots.filter(function(shot){
        return shot.y < canvas.height;
    });
}

function updateGameState(){
    if(game.state == 'playing' && enemies.length == 0){
        game.state = 'victory';
        replyText.title = 'You saved the earth!';
        replyText.subtitle = 'press R key to reboot';
        replyText.counter = 0;
        removeShots();
    }

    if(replyText.counter >= 0){
        replyText.counter++;
    }

    if((game.state == 'lost' || game.state == 'victory') && keyboard[82]){
        game.state = 'init';
        shispace.state = 'alive';
        replyText.counter = -1;
    }
}

function removeEnemies(){
    for(let i in enemies){
        delete enemies[i];
    }
}

function removeShots(){
    for(let i in shots){
        delete shots[i];
    }

    for(let i in enemyShots){
        delete enemyShots[i];
    }
}

function drawText(){
    
    if(replyText.counter == -1) return;
    
    let tmp = replyText.counter/50.0;
    
    if(tmp > 1){
        removeEnemies();
        removeShots();
    }

    ctx.save();
    ctx.globalAlpha = tmp;

    if(game.state == 'victory' || game.state == 'lost'){
        ctx.fillStyle = 'white';
        ctx.font = 'Bold 50pt Arial';
        ctx.fillText(replyText.title,100,200);
        ctx.font = '20pt Arial';
        ctx.fillText(replyText.subtitle,200,250);
    }
}

function frameLoop(){
    updateGameState();
    upgradeEnemies();
    moveSpaceship();
    moveShooting();
    moveShooting();
    moveEnemyShots();
    drawBackground();
    drawShispace();
    drawShot();
    drawEnemyShots();
    drawEnemies();
    verifyContact();
    drawText();
}


loadMedia();
addKeyboardEvents();
"use strict"

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var shispace = {x:canvas.width/2,y:canvas.height-75,width:50,height:50}
var fondo;
var keyboard = {};

function loadMedia(){
    fondo = new Image();
    fondo.src = '../resources/space2.jpeg';
    fondo.onload = function(){
        var intervalo = window.setInterval(frameLoop,1000/55);
    }
}

function drawBackground(){
    ctx.drawImage(fondo,0,0);
}

function drawShispace(){
    ctx.save();
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(shispace.x,shispace.y,shispace.width,shispace.height);
    ctx.restore();
}

function addKeyboardEvents(){

    addEvent(document,'keydown',function(e){
        keyboard[e.keyCode] = true;
        console.log(e.keyCode);
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

function frameLoop(){
    drawBackground();
    drawShispace();
}

loadMedia();
addKeyboardEvents();
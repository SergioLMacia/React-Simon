import React, { Component } from 'react';
import logo from './logo.svg';
import './css/App.css';
import SweetAlert from 'react-bootstrap-sweetalert';

var AudioContext = window.AudioContext || window.webkitAudioContext || false;
if(!AudioContext) {
  alert('Sorry, but the Web Audio API is not supported by your browser.'
    + ' Please, consider downloading the latest version of '
    + 'Google Chrome or Mozilla Firefox');
} else {
  var audioCtx = new AudioContext();
  var frequencies = [329.63,261.63,220,194.81];
  var errOsc = audioCtx.createOscillator();
  errOsc.type = 'triangle';
  errOsc.frequency.value = 110;
  errOsc.start(0.0); //delay optional parameter is mandatory on Safari
  var errNode = audioCtx.createGain();
  errOsc.connect(errNode);
  errNode.gain.value = 0;
  errNode.connect(audioCtx.destination);
  var ramp = 0.05;
  var vol = 0.5;
  var oscillators = frequencies.map(function(frq){
    var osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frq;
    osc.start(0.0); 
    return osc;
  });
  var gainNodes = oscillators.map(function(osc){
    var g = audioCtx.createGain();
    osc.connect(g);
    g.connect(audioCtx.destination);
    g.gain.value = 0;
    return g;
  });
}
function playGoodTone(num){gainNodes[num].gain.linearRampToValueAtTime(vol, audioCtx.currentTime + ramp);}
function stopGoodTones(){gainNodes.forEach(function(g){g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + ramp);});}
function playErrTone(){errNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + ramp);}
function stopErrTone(){errNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + ramp);} 


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameStarted:false,
      active:0,
      playingSound:false,
      colores:[],
      currentColor:0,
      gameOverAlert: null,
    };
    this.btnHold = this.btnHold.bind(this);
    this.btnRelease = this.btnRelease.bind(this);
  }
  btnHold(value){
    this.setState({"active":value});
    var sound = value-1;
    if(value===-1) playErrTone();
    else playGoodTone(sound);  
  }
  btnRelease(){
    this.setState({"active":0});
    stopGoodTones();
    stopErrTone();
  }
  startGame(){
    if(this.state.gameStarted===true) return;
    var ref=this;
    this.setState({"gameStarted":true,"active":0,"playingSound":false,"colores":[],"currentColor":0,});
    setTimeout(function(){
      ref.addNewColor();
      ref.playSequence();
    },100);
  }
  playSequence(){
    var colores = this.state.colores;
    var currentItem = 0;
    var ref = this;
    this.setState({"playingSound":true});
    var ritmo = setInterval(function(){
      ref.btnRelease();
      setTimeout(()=>{
        if(currentItem<colores.length){
          ref.btnHold(colores[currentItem]);
          currentItem++;
        }else{
          clearInterval(ritmo);
          ref.setState({"playingSound":false});
        }
      },100);
    },1100);
  }
  addNewColor(){
    var color=this.state.colores;
    color.push((Math.floor(Math.random()*100)%4)+1);
    this.setState({"colores":color});
  }

  eventHandler(btn){
    if(this.state.active!==0 || this.state.playingSound===true || this.state.gameStarted!==true) return;
    var colores = this.state.colores, 
      nmax = colores.length-1,
      current = this.state.currentColor;
      setTimeout(()=>this.btnRelease(),900); //Set timer
      if(btn===colores[current]){ //Play sound and do taks while timer is running
        this.btnHold(btn);
        if(current<nmax) this.setState({"currentColor":(current+1)});
        else{
          this.setState({"currentColor":0});
          this.addNewColor();
          var ref = this;
          setTimeout(()=>{ref.playSequence();},1000);
        }
      } else {
        this.btnHold(-1);
        const showgameOverAlert = () => (
          <SweetAlert 
            error
            showCancel={false} 
            title="¡Ups!" 
            onConfirm={() => this.hideGameOverAlert()}
            confirmBtnText="Volver a empezar"
          >
            <h4>Te has equivocado <small>:(</small></h4>
          </SweetAlert>
        );
        this.setState({"gameStarted":false,"gameOverAlert":showgameOverAlert()});
      }
  }
  hideGameOverAlert() {
    this.setState({gameOverAlert: null});
  }
  render() {
    var gameStarted = this.state.gameStarted, active = this.state.active;
    return (
      <div className="App">
      <div className="visitame">Visítame en <a href="https://www.smacia.es" target="_blank" rel="noopener noreferrer">www.smacia.es</a></div>
       <div className="App-header">
          <h2 className="game-title">Simon <small>&reg;</small></h2>
          <button className={"btn btn-primary"} disabled={(gameStarted===true?" disabled":"")} onClick={this.startGame.bind(this)}>Empezar partida</button>
          <div className="scoreboard"><span>Puntuación: <big>{this.state.colores.length>0?(this.state.colores.length-1):"0"}</big></span></div>
        </div>
        <div id="game">
          <div id="filler">
            <img src={logo} className="App-logo" alt="logo" />
          </div>
          <div id="btn-green" className={active===1?"active":""} onClick={()=>{this.eventHandler(1)}}></div>
          <div id="btn-red" className={active===2?"active":""} onClick={()=>{this.eventHandler(2)}}></div>
          <div id="btn-yellow" className={active===3?"active":""} onClick={()=>{this.eventHandler(3)}}></div>
          <div id="btn-blue" className={active===4?"active":""} onClick={()=>{this.eventHandler(4)}}></div>
        </div>
        {this.state.gameOverAlert}
      </div>
    );
  }    
}

export default App;

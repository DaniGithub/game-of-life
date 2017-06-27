import React from 'react';
import ReactDOM from 'react-dom';
require('./scss/main.scss');

export default class Root extends React.Component {
  constructor() {
    super()
    this.state = {
      canWidth: 0,
      canHeight: 0,
      squareSize: 10,
      genCount: 0
    }
    this.data = {
      board: [],
      newBoardStates: [],
      isRunning: true,
      currentCount: 0,
      id: null
    }

    this.sizeHandler = this.sizeHandler.bind(this);
    this.buildCells = this.buildCells.bind(this);
    this.checkRules = this.checkRules.bind(this);
    this.calcLiving = this.calcLiving.bind(this);
    this.clearBoard = this.clearBoard.bind(this);
    this.save = this.save.bind(this);
    this.optionsHandler = this.optionsHandler.bind(this);
    this.canvasClick = this.canvasClick.bind(this);
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  buildCells(clear) {
    let MAX_X = this.state.canWidth / this.state.squareSize, MAX_Y = this.state.canHeight / this.state.squareSize;
    this.data.board = [];
    function calculateNeighbours(x,y) {
      let neighbours = [
        [x-1, y-1],
        [x, y-1],
        [x+1, y-1],
        [x-1, y],        
        [x+1, y],
        [x-1, y+1],
        [x, y+1],
        [x+1, y+1],        
      ]
      neighbours = neighbours.filter(neighbour=>{
        if(neighbour[0] < 0 || neighbour[1] < 0) return false;
        if(neighbour[0] > MAX_X - 1 || neighbour[1] > MAX_Y - 1) return false;
        return true;
      })
      return neighbours;
    }
    for(var y = 0; y < MAX_Y; y++) {
      for(var x = 0; x < MAX_X; x++) {
        let arr = [
          x,y,clear >= 0 ? clear : this.getRandomInt(0,1),calculateNeighbours(x,y)
        ];

        this.data.board.push(arr)
      }
    }
    //Add indices for neighbours
    for(let i = 0; i < this.data.board.length; i++) {
      for(let k = 0;k < this.data.board[i][3].length; k++) {
        for(let j = 0; j < this.data.board.length; j++) {
          if(this.data.board[j][0] === this.data.board[i][3][k][0] && this.data.board[j][1] === this.data.board[i][3][k][1]) {
            this.data.board[i][3][k].push(j)
          }
        }
      }
    }
  }

  drawGrid(ctx) {
    for(var i = 0; i <= this.state.canWidth; i += this.state.squareSize) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(153, 153, 153, 0.25)';
      ctx.moveTo(i,0);
      ctx.lineTo(i, this.state.canHeight);
      ctx.moveTo(0,i);
      ctx.lineTo(this.state.canWidth,i);        
      ctx.stroke();
    }    
  }

  sizeHandler(e) {
    let newWidth = 0, newHeight = 0;
    if(e.currentTarget.classList.contains('small')) {
      newWidth = 50 * this.state.squareSize;
      newHeight = 30 * this.state.squareSize;
    } else if(e.currentTarget.classList.contains('medium')) {
        newWidth = 70 * this.state.squareSize;
        newHeight = 50 * this.state.squareSize;
    } else if(e.currentTarget.classList.contains('large')) {
        newWidth = 100 * this.state.squareSize;
        newHeight = 80 * this.state.squareSize;
    }

    this.setState({
      canWidth: newWidth,
      canHeight: newHeight
    })
  }

  save() {
    this.clearBoard();
    this.data.newBoardStates.forEach(cell=>{
      this.data.board[cell[1]][2] = cell[0]
    })
    this.data.newBoardStates = [];
  }

  calcLiving(neighbours) {
    let total = 0;
    for(let i = 0; i < neighbours.length; i++) {
      if(this.data.board[neighbours[i][2]][2] === 1) total++
    }
    return total;
  }

  clearBoard() {
    this.data.board.forEach((cell)=>cell[2]=0)
  }

  checkRules(cell, index) {
    let total = this.calcLiving(cell[3]), newState = [];
    // If original cell is alive
    if(cell[2] === 1) {
      if(total < 2 && total > 3) {
        //dies
        newState.push(0,index)

      }
      if(total === 2 || total === 3) {
        //lives
        newState.push(1,index)
      }
    } 
    // If original cell is dead
    if(cell[2] === 0) {
      if(total === 3) {
        //lives
        newState.push(1,index)
      }
    }
    if(newState.length > 0) this.data.newBoardStates.push(newState)
    
  }

  draw(ctx) {
    if(this.state.canWidth > 0) {
      ctx.clearRect(0, 0, this.state.canWidth, this.state.canHeight);
      this.drawGrid(ctx)
      for(let i = 0; i < this.data.board.length; i++) {
        this.checkRules(this.data.board[i], i);
        if(this.data.board[i][2] === 1) {
          ctx.clearRect(this.data.board[i][0] * this.state.squareSize,this.data.board[i][1] * this.state.squareSize,this.state.squareSize,this.state.squareSize)
          ctx.fillStyle="red";
          ctx.fillRect(this.data.board[i][0] * this.state.squareSize,this.data.board[i][1] * this.state.squareSize,this.state.squareSize,this.state.squareSize)
        }
        
      }
      this.save();
    }

   // requestAnimationFrame(this.draw.bind(this, ctx));
  }

  start(speed, ctx) {
    this.data.id = setInterval(()=>{
      if(this.data.isRunning) {
        let countElement = document.querySelector('#gameWrapper > p > span');
        this.data.currentCount = countElement.innerHTML        
        countElement.innerHTML = +this.data.currentCount + 1;
        this.draw(ctx)
      }
    },1000/speed)
  } 

  componentDidMount() {
    document.querySelector('.medium').click()
  } 

  componentDidUpdate() {
    let canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
    this.buildCells();
    

    this.start.call(this, 10, ctx)
    //requestAnimationFrame(this.draw.bind(this, ctx));
  }

  optionsHandler(e) {
    let canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
    if(e.currentTarget.classList.contains('start')) {
      this.data.isRunning = !this.data.isRunning;
      e.currentTarget.innerText === "Pause" ? e.currentTarget.innerText = "Start" : e.currentTarget.innerText = "Pause" 
    }
    if(e.currentTarget.classList.contains('clear')) {
      this.data.board = [];
      this.data.newBoardStates = [];
      let countElement = document.querySelector('#gameWrapper > p > span').innerHTML = 0;
      let canvas = document.getElementById('game'), ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, this.state.canWidth, this.state.canHeight);
      this.buildCells(0);
    }
    if(e.currentTarget.classList.contains('slow')) {
      clearInterval(this.data.id)
      this.start.call(this, 10, ctx)
    }
    if(e.currentTarget.classList.contains('medium')) {
      clearInterval(this.data.id)
      this.start.call(this, 20, ctx)
    }           
    if(e.currentTarget.classList.contains('fast')) {
      clearInterval(this.data.id)
      this.start.call(this, 30, ctx)
    }
  }  

  canvasClick(e) {
    let x = Math.floor(e.clientX - e.currentTarget.getBoundingClientRect().left)
    let y = Math.floor(e.clientY - e.currentTarget.getBoundingClientRect().top)
    x = Math.floor(x / this.state.squareSize),
    y = Math.floor(y / this.state.squareSize)

    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "red";
    ctx.fillRect(x * this.state.squareSize, y * this.state.squareSize, this.state.squareSize, this.state.squareSize)    

    this.data.board.forEach(cell=>{
      if(cell[0] === x && cell[1] === y) {
        cell[2] = 1;
      }
    })
  }




  render() {
    return (
      <section id="gameWrapper">
        <p>Generations Elapsed: <span>0</span></p>
        <canvas id="game" onClick={this.canvasClick} width={this.state.canWidth} height={this.state.canHeight}></canvas>
        <section id="options">
            <div id="size">
                <span>Size:</span>
                <button onClick={this.sizeHandler} className="small">50x30</button>
                <button onClick={this.sizeHandler} className="medium">70x50</button>
                <button onClick={this.sizeHandler} className="large">100x80</button>
            </div>
            <div id="startStop">
              <span>Options:</span>
              <button onClick={this.optionsHandler} className="start">Pause</button>
              <button onClick={this.optionsHandler} className="clear">Clear</button>              
            </div>
            <div id="speed">
              <span>Speed:</span>
              <button onClick={this.optionsHandler} className="slow">Slow</button>
              <button onClick={this.optionsHandler} className="medium">Medium</button>              
              <button onClick={this.optionsHandler} className="fast">Fast</button>              
            </div>                          
        </section>        
      </section>     
    )
  }
}

ReactDOM.render(<Root/>, document.getElementById('app'))
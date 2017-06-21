import React from 'react';
import ReactDOM from 'react-dom';
require('./scss/main.scss')

export default class Root extends React.Component {
  constructor() {
    super()
    this.state = {
      canWidth: 0,
      canHeight: 0,
      squareSize: 10,
    }
    this.data = {
      board: [],
      boardMutations: [],
      running: true   
    }

    this.optionsHandler = this.optionsHandler.bind(this);
    this.sizeHandler = this.sizeHandler.bind(this);
    this.canClickHandler = this.canClickHandler.bind(this);
    this.buildCells = this.buildCells.bind(this);
    this.calculateNeighbours = this.calculateNeighbours.bind(this);
    this.markAlive = this.markAlive.bind(this);
    this.markDead = this.markDead.bind(this)
    this.copy = this.copy.bind(this);
    this.updateNeighbours = this.updateNeighbours.bind(this)
    this.perfCheck = this.perfCheck.bind(this)
    this.save = this.save.bind(this);
  }

  copy(o) {
    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
        v = o[key];
        output[key] = (typeof v === "object") ? this.copy(v) : v;
    }
    return output;
  }  

  markAlive(x,y,board) {
    board.forEach(cell=>{
      if(cell[0] === x && cell[1] === y) {
        cell[2] = 1;
      }
    })
  }
  markDead(x,y,board) {
    board.forEach(cell=>{
      if(cell[0] === x && cell[1] === y) {
        cell[2] = 0;
      }
    })
  }

  calculateNeighbours(x,y) {
    let neighbours = [[x-1, y-1],[x, y-1],[x+1, y-1],[x-1, y],[x+1, y],[x-1, y+1],[x, y+1],[x+1, y+1]]
    neighbours = neighbours.filter(neighbour=>{
      let MAX_X = this.state.canWidth / this.state.squareSize;
      let MAX_Y = this.state.canHeight / this.state.squareSize;
      if(neighbour[0] > MAX_X) return false;
      if(neighbour[1] > MAX_Y) return false;
      if(neighbour[0] < 0) return false;
      if(neighbour[1] < 0) return false;      
      return neighbour;
    })
    return neighbours
  }  

  optionsHandler(e) {
    if(e.currentTarget.classList.contains('start')) {
      this.data.running = true;
    }
    if(e.currentTarget.classList.contains('stop')) {
      this.data.running = false;
    }
    if(e.currentTarget.classList.contains('clear')) {
      this.data.board = [];
      this.data.boardMutations = [];
      this.buildCells();
    }           
  }

  sizeHandler(e) {
  let newWidth = 0, newHeight = 0, newMaxX = 0, newMaxY = 0;
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
    canHeight: newHeight,
  },this.buildCells)

}

canClickHandler(e) {
  let x = Math.floor(e.clientX - e.currentTarget.getBoundingClientRect().left)
  let y = Math.floor(e.clientY - e.currentTarget.getBoundingClientRect().top)
  x = Math.floor(x / this.state.squareSize),
  y = Math.floor(y / this.state.squareSize)

  let canvas = document.getElementById('game');
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = "red";
  ctx.fillRect(x * this.state.squareSize, y * this.state.squareSize, this.state.squareSize, this.state.squareSize)
  
  this.markAlive(x,y, this.data.boardMutations)
}


  buildCells() {
    for(let y = 0; y < this.state.canHeight / this.state.squareSize; y++) {
      for(let x = 0; x < this.state.canWidth / this.state.squareSize; x++) {
        let cell = [x,y,0,[
          ...this.calculateNeighbours(x,y)
        ]]
        if(cell[0] === 2 && cell[1] === 2 ||
           cell[0] === 3 && cell[1] === 2 ||
           cell[0] === 4 && cell[1] === 2) {
           cell[2] = 1;
        }
        if(cell[0] === 5 && cell[1] === 10 ||
           cell[0] === 6 && cell[1] === 10 ||
           cell[0] === 7 && cell[1] === 10) {
           cell[2] = 1;
        }        

        if(cell[0] === 13 && cell[1] === 21 ||
           cell[0] === 14 && cell[1] === 22 ||
           cell[0] === 15 && cell[1] === 22 ||
           cell[0] === 16 && cell[1] === 22 ||
           cell[0] === 17 && cell[1] === 21 ||
           cell[0] === 16 && cell[1] === 20 ||
           cell[0] === 15 && cell[1] === 20 ||
           cell[0] === 14 && cell[1] === 20) {
           cell[2] = 1;
        }              

 
        let cellCopy = this.copy(cell);
        this.data.boardMutations.push(cellCopy)
        this.data.board.push(cell);
      }
    }

  }

  perfCheck(cell,i) {
    let info = {
      originalState:0,
      numOfAliveNeighbours:0,
      x:null,
      y:null,
      index: i
    }
    info.x = cell[0], info.y = cell[1], info.originalState = cell[2];
    cell[3].forEach(neighbour=>{
      if(neighbour[2] === 1) {
         info.numOfAliveNeighbours++;   
      }
    })

    //Any alive cell
    if(info.originalState === 1) {
      if(info.numOfAliveNeighbours === 2 || info.numOfAliveNeighbours === 3) {
        this.data.boardMutations[i][2] = 1;
      }            
      if(info.numOfAliveNeighbours < 2 || info.numOfAliveNeighbours > 3) {
        this.data.boardMutations[i][2] = 0;
      }      
    }          

    //Any dead cell
    if(info.originalState === 0) {
      if(info.numOfAliveNeighbours === 3) {
        this.data.boardMutations[i][2] = 1;
      }
    }

  }  

  save() {

    if(this.data.boardMutations.length > 0) {
      // console.log('first')
      for(let i = 0; i < this.data.boardMutations.length; i++) {
        let cell = this.data.boardMutations[i], copyCell = this.copy(this.data.boardMutations[i]);
        this.data.board[i] = cell;
        this.data.boardMutations[i] = copyCell;
      }
    } else {
      // console.log('second')
      for(let i = 0; i < this.data.board.length; i++) {
        let cell = this.data.board[i], copyCell = this.copy(this.data.board[i]);
        this.data.board[i] = cell;
        this.data.boardMutations[i] = copyCell;
      }
    }
  }

  updateNeighbours(neighbours) {

      let arr = [];
      neighbours.forEach(neighbour=>{
        this.data.board.forEach(cell=>{
          if(cell[0] === neighbour[0] && cell[1] === neighbour[1]) {
            arr.push(cell)
          }
        })
      })
      return arr;


  }    

  draw(ctx) {
    // console.log(this.data.board[2] === this.data.boardMutations[2])
    if(this.state.canWidth > 0 && this.data.running) {

     // ctx.clearRect(0, 0, this.state.canWidth, this.state.canHeight);
      for(let i = 0; i < this.data.board.length; i++) {
        let squareSize = this.state.squareSize, board = this.data.board;
        let count = 0;
        this.data.board[i][3].forEach(cell=>{
          if(cell !== undefined && cell[2] === 1) {
            count++;
          }
        })
        this.data.board[i][3] = this.updateNeighbours(this.data.board[i][3]);        
        //Cell is dead
        if(board[i][2] === 0) {
          ctx.strokeStyle = 'rgba(34, 34, 34, 0.5)';
          ctx.clearRect(board[i][0] * squareSize, board[i][1] * squareSize, squareSize, squareSize);          
          ctx.strokeRect(board[i][0] * squareSize, board[i][1] * squareSize, squareSize, squareSize);
          this.markDead(this.data.board[i][0],this.data.board[i][1],this.data.boardMutations)
        }
        //Cell is alive
        if(board[i][2] === 1) {
          ctx.fillStyle = "red";
          ctx.fillRect(board[i][0] * squareSize, board[i][1] * squareSize, squareSize, squareSize);
          this.markAlive(this.data.board[i][0],this.data.board[i][1],this.data.boardMutations)
        }
        this.perfCheck(this.data.board[i], i)
      }
    }
    this.save();
    requestAnimationFrame(this.draw.bind(this,ctx))
  }

  componentDidMount() {
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    
 
    requestAnimationFrame(this.draw.bind(this,ctx))
    // setInterval(()=>{
    //   this.save();
    //   this.draw(ctx);

    // },1000/60)
  }

  componentDidUpdate() {

  }


  render() {
    return (
      <section id="gameWrapper">
        <canvas id="game" onClick={this.canClickHandler}width={this.state.canWidth} height={this.state.canHeight}></canvas>
        <section id="options">
            <div id="size">
                Size:
                <button onClick={this.sizeHandler} className="small">50x30</button>
                <button onClick={this.sizeHandler} className="medium">70x50</button>
                <button onClick={this.sizeHandler} className="large">100x80</button>
            </div>
            <div id="options">
              Options:
              <button onClick={this.optionsHandler} className="start">Start</button>
              <button onClick={this.optionsHandler} className="stop">Pause</button>
              <button onClick={this.optionsHandler} className="clear">Clear</button>              
            </div>
        </section>        
      </section>
    )
  }
}

ReactDOM.render(<Root/>, document.getElementById('app'))
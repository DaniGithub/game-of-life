import React from 'react';
import ReactDOM from 'react-dom';
require('./scss/main.scss')

export default class Root extends React.Component {
  constructor() {
    super()
    this.state = {
      canWidth: 0,
      canHeight: 0,
      MAX_X: null,
      MAX_Y: null,
      squareSize: 10,
    }
    this.data = {
      board: [],
      boardCopy: [],
      customActive: [[4,5],[5,5],[6,5]],
      running: true
    }

    this.optionsHandler = this.optionsHandler.bind(this);
    this.sizeHandler = this.sizeHandler.bind(this);
    this.initialState = this.initialState.bind(this);

    this.Cell = this.Cell.bind(this);
    this.newCoords = this.newCoords.bind(this);
    this.draw = this.draw.bind(this);
    this.checkRules = this.checkRules.bind(this);
    this.numOfAliveNeighbours = this.numOfAliveNeighbours.bind(this);
    this.canClickHandler = this.canClickHandler.bind(this);
    this.markCellAlive = this.markCellAlive.bind(this);
    this.markCellDead = this.markCellDead.bind(this);
    this.copy = this.copy.bind(this);
  }

  newCoords(x,y,MAX_X,MAX_Y) {
    if(x > MAX_X) return false;
    if(y > MAX_Y) return false;
    if(x < 0) return false;
    if(y < 0) return false;
    return {x,y}
  }

  Cell(x, y, MAX_X, MAX_Y, rThis) {
    this.coords = rThis.newCoords(x,y, MAX_X, MAX_Y, rThis);
    this.neighbourCords = [
       rThis.newCoords(x-1, y-1, MAX_X, MAX_Y, rThis),
       rThis.newCoords(x,   y-1, MAX_X, MAX_Y, rThis),
       rThis.newCoords(x+1, y-1, MAX_X, MAX_Y, rThis),
       rThis.newCoords(x-1, y, MAX_X, MAX_Y, rThis),        
       rThis.newCoords(x+1, y, MAX_X, MAX_Y, rThis),
       rThis.newCoords(x-1, y+1, MAX_X, MAX_Y, rThis),
       rThis.newCoords(x,   y+1, MAX_X, MAX_Y, rThis),
       rThis.newCoords(x+1, y+1, MAX_X, MAX_Y, rThis), 
              
    ],
    this.isAlive = false,
    this.isDead = true
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

  initialState(MAX_X, MAX_Y) {
    for(let y = 0; y < MAX_Y; y++) {
      for(let x = 0; x < MAX_X; x++) {
        let cell = new this.Cell(x,y,MAX_X,MAX_Y,this);
        
        if(cell.coords.x === 5 && cell.coords.y === 5) {cell.isAlive = true; cell.isDead = false};
        if(cell.coords.x === 6 && cell.coords.y === 5) {cell.isAlive = true; cell.isDead = false};
        if(cell.coords.x === 7 && cell.coords.y === 5) {cell.isAlive = true; cell.isDead = false};        

        this.data.board.push(cell);

        //Clean ivalid neighbours
        cell.neighbourCords = cell.neighbourCords.filter(neighbour => {
          if(Object.keys(neighbour).length > 0 && neighbour.constructor === Object) {
            return true;
          }
        })            
      }
    }

    this.data.boardCopy = this.copy(this.data.board)

  }

  markCellAlive(x,y,board) {
    board.forEach(cell=>{
      if(cell.coords.x === x && cell.coords.y === y) {
        cell.isAlive = true;
        cell.isDead = false;
      }
    })
  }

  markCellDead(x,y,board) {
    board.forEach(cell=>{
      if(cell.coords.x === x && cell.coords.y === y) {
        cell.isAlive = false;
        cell.isDead = true;
      }
    })
  }  

  optionsHandler(e) {
    if(e.currentTarget.classList.contains('start')) {
      this.data.running = true;
    }
    if(e.currentTarget.classList.contains('stop')) {
      this.data.running = false;
    }    
  }

  sizeHandler(e) {
  let newWidth = 0, newHeight = 0, newMaxX = 0, newMaxY = 0;
  if(e.currentTarget.classList.contains('small')) {
    newWidth = 50 * this.state.squareSize;
    newHeight = 30 * this.state.squareSize;
    newMaxX = newWidth / this.state.squareSize;
    newMaxY = newHeight / this.state.squareSize;
  } else if(e.currentTarget.classList.contains('medium')) {
      newWidth = 70 * this.state.squareSize;
      newHeight = 50 * this.state.squareSize;
      newMaxX = newWidth / this.state.squareSize;
      newMaxY = newHeight / this.state.squareSize;      
  } else if(e.currentTarget.classList.contains('large')) {
      newWidth = 100 * this.state.squareSize;
      newHeight = 80 * this.state.squareSize;
      newMaxX = newWidth / this.state.squareSize;
      newMaxY = newHeight / this.state.squareSize;      
  }

  this.setState({
    canWidth: newWidth,
    canHeight: newHeight,
    MAX_X: newMaxX,
    MAX_Y: newMaxY
  })

  this.initialState(newMaxX, newMaxY);
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
  
  this.markCellAlive(x, y, this.data.boardCopy)
  this.data.customActive.push([x,y])
}

  numOfAliveNeighbours(cell) {
    let mix = [null,0,cell], temp=[]
    for(let i = 0, keys = Object.keys(cell.neighbourCords); i < keys.length; i++) {
      for(let k = 0, keys = Object.keys(this.data.board); k < keys.length; k++) {
        if(cell.neighbourCords[i].x === this.data.board[k].coords.x &&
           cell.neighbourCords[i].y === this.data.board[k].coords.y) {
            if(this.data.board[k].isAlive && cell.isAlive) {
              mix[0] = true;
              mix[1]++;
              mix[2] = cell;
              mix[3] = [cell.coords.x, cell.coords.y];
              temp.push(this.data.board[k]);
            }

          //Check for dead cells but with more than 0 alive neighbours
          if(this.data.board[k].isAlive && !cell.isAlive) {
              mix[0] = false;
              mix[1]++;
              mix[2] = cell;
              mix[3] = [cell.coords.x, cell.coords.y];
             temp.push(this.data.board[k]);
          }
        }
      }
    }
    //if(mix[1] > 0) console.log(mix, temp)
    return mix[1] > 0 ? mix : false;

  }

  checkRules() {
    function theRules(mix) {
      if(mix) {
        let cell = {
          isAlive: mix[0],
          numOfAliveNeighbours: mix[1],
          cellRef: mix[2],
          coords: mix[3]
        }        
        //Any alive cell
        if(cell.isAlive) {
          if(cell.numOfAliveNeighbours === 2 || cell.numOfAliveNeighbours === 3) {
            this.markCellAlive(cell.coords[0], cell.coords[1], this.data.boardCopy)
          }            
          if(cell.numOfAliveNeighbours < 2 || cell.numOfAliveNeighbours > 3) {
            this.markCellDead(cell.coords[0], cell.coords[1], this.data.boardCopy)
          }      
        }          
        
        //Any dead cell
        if(!cell.isAlive) {
          if(cell.numOfAliveNeighbours === 3) {
            this.markCellAlive(cell.coords[0], cell.coords[1], this.data.boardCopy)
          }
        }    
      }
    }
    theRules = theRules.bind(this);

    for(let i = 0, keys = Object.keys(this.data.board); i < keys.length; i++) {
      let mix = this.numOfAliveNeighbours(this.data.board[i]);
      theRules(mix)
    }
    this.data.board = this.copy(this.data.boardCopy)
    return true;
  }

  draw(ctx) {
    for(let i = 0; i < this.data.board.length; i++) {
        let cell = this.data.board[i], 
            x = this.data.board[i].coords.x, 
            y = this.data.board[i].coords.y,
            squareSize = this.state.squareSize;
            
        if(cell.isDead) {
          ctx.strokeStyle = 'rgba(34, 34, 34, 0.5)';
          ctx.clearRect(x * squareSize, y * squareSize, squareSize, squareSize);          
          ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
          cell.isAlive = false;
        }

        if(cell.isAlive) {
          ctx.fillStyle = "red";
          ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
          cell.isDead = true;          
        }      
    }  
  }

  componentDidMount() {
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');

    function animate() {
      if(this.state.canWidth > 0 && this.data.running) {
        this.checkRules();
        this.draw(ctx)
      }
      requestAnimationFrame(animate)
    }
    animate = animate.bind(this);

    requestAnimationFrame(animate)
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
              <button onClick={this.optionsHandler} className="stop">Stop</button>
            </div>
        </section>        
      </section>
    )
  }
}

ReactDOM.render(<Root/>, document.getElementById('app'))
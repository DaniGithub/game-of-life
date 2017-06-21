import React from 'react';
import ReactDOM from 'react-dom';
require('./scss/main.scss')

export default class Root extends React.Component {
  constructor() {
    super()
    this.state = {
      canWidth: 0,
      canHeight: 0,
      squareSize: 10
    }
    this.sizeHandler = this.sizeHandler.bind(this);
    this.draw = this.draw.bind(this);
    this.checkNeighbours = this.checkNeighbours.bind(this);
    this.inactiveCells = this.inactiveCells.bind(this);
    this.isValidCords = this.isValidCords.bind(this);
    this.isActive = this.isActive.bind(this);
    this.removeActiveCell = this.removeActiveCell.bind(this);
    this.data = {
      activeCells: []
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

  isActive(x,y) {
    for(let i = 0; i < this.data.activeCells.length; i++) {
      if(this.data.activeCells[i][0] === x && this.data.activeCells[i][1] === y) {
        return true;
      }
    }
    return false;
  }  

  checkNeighbours(activeCells, skipValue) {
    //console.log("activeCells", activeCells)
    let neighbours = [];
    function perfCheck(possibleNeighbours, currentCell, skipValue) {
      //console.log(possibleNeighbours)
      var allNeighbours =  [];


      for(let i = 0; i < possibleNeighbours.length; i++) {
        if(this.isActive(possibleNeighbours[i][0], possibleNeighbours[i][1])) {
          allNeighbours.push(possibleNeighbours[i])
        }
      }

      console.log('allNeighbours', allNeighbours)

      return allNeighbours.length > 0 ? [[currentCell, [...allNeighbours]]]:[];
    }
    perfCheck = perfCheck.bind(this);
    activeCells.forEach((cell,i)=>{
      // Possible Neighbour Coordinates
      let possibleNeighbours = [
        [cell[0]-1, cell[1]-1],
        [cell[0], cell[1]-1],
        [cell[0]+1, cell[1]-1],
        [cell[0]-1, cell[1]],        
        [cell[0]+1, cell[1]],
        [cell[0]-1, cell[1]+1],
        [cell[0], cell[1]+1],
        [cell[0]+1, cell[1]+1],        
      ]

      // Exclude-Self
      if(skipValue) {
        possibleNeighbours.forEach((neighbour,i)=>{
          if(neighbour[0] === skipValue[0] && neighbour[1] === skipValue[1]) {
            possibleNeighbours.splice(i,1)
          }
        })
      }
       
     // If any of the neighbours is active
       neighbours = neighbours.concat(perfCheck(possibleNeighbours, cell));
       
    })
    return neighbours.length > 0 ? neighbours : false;
  }

  isValidCords(x,y) {
    if(x < 0 || y < 0) {return false;}
    
    if(x > (this.state.canWidth / this.state.squareSize) ||
       y > (this.state.canHeight / this.state.squareSize)) {
         return false;
       }
    return [x,y];
  }

  removeActiveCell(coords) {
    this.data.activeCells.forEach((cell,i)=>{
      if(cell[0] === coords[0] && cell[1] === coords[1]) {
        this.data.activeCells.splice(i,1)
      }
    })
  }



  inactiveCells() {
    function goUp(x,y,that) {
      if(that.isValidCords(x, y-1)) {
        let neighbour = that.checkNeighbours([[x, y-1]], [x,y]);
        if(!neighbour) return null;          
        if(neighbour[0][1].length === 3) {
          //console.log(neighbour[0][0], ' has a neighbour of the right amount')
          return neighbour[0][0];
        }
      }
    }
    function goDown(x,y,that) {
      if(that.isValidCords(x, y+1)) {
        let neighbour = that.checkNeighbours([x, y+1], [x,y]);
        if(!neighbour) return null;
        if(neighbour[0][1].length === 3) {
          //console.log(neighbour[0][0], ' has a neighbour of the right amount')
          return neighbour[0][0];
        }
      }      
    }    
    function goLeft(x,y,that) {
      if(that.isValidCords(x-1, y)) {
        let neighbour = that.checkNeighbours([x-1, y], [x,y]);
        if(!neighbour) return null;
        if(neighbour[0][1].length === 3) {
          //console.log(neighbour[0][0], ' has a neighbour of the right amount')
          return neighbour[0][0];
        }
      }        
    }    
    function goRight(x,y,that) {
      if(that.isValidCords(x+1, y)) {
        let neighbour = that.checkNeighbours([x+1, y], [x,y])
        if(!neighbour) return null;
        if(neighbour[0][1].length === 3) {
          //console.log(neighbour[0][0], ' has a neighbour of the right amount')
          return neighbour[0][0];
        }
      }          
    }        

    let newActive = [];
    for(let i = this.data.activeCells.length-1; i >= 0; i--) {
      let x = this.data.activeCells[i][0], y = this.data.activeCells[i][1];

      newActive.push(goDown(x,y,this));
      newActive.push(goLeft(x,y,this));
      newActive.push(goUp(x,y,this));
      newActive.push(goUp(x,y,this));
      newActive.push(goRight(x,y,this));
      newActive.push(goRight(x,y,this));
      newActive.push(goDown(x,y,this));
      newActive.push(goDown(x,y,this));

      if(i === 0) {
        // console.log('New', newActive)
      }
    }
  }

  draw(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.inactiveCells();
    for(var y = 0; y <= this.state.canHeight; y += this.state.squareSize) {
      for(var x = 0; x <= this.state.canWidth; x += this.state.squareSize) {
        this.data.activeCells.forEach(cell=>{
          if(x / this.state.squareSize === cell[0] && y / this.state.squareSize === cell[1]) {
            ctx.fillStyle = "red";
            ctx.fillRect(x, y, this.state.squareSize, this.state.squareSize)
          }
        })
        ctx.strokeStyle = 'rgba(34, 34, 34, 0.5)';
        ctx.strokeRect(x, y, this.state.squareSize, this.state.squareSize)
      }
    }

    let neighbours = this.checkNeighbours(this.data.activeCells);
    // Rules
      //Any live cell with fewer than two live neighbours dies, 
      //as if caused by underpopulation.
      // console.log(neighbours)
        // for(let i = 0; i < neighbours.length; i++) {
        //   if(neighbours[i][1].length < 2 || neighbours[i][1].length > 3 ) {
        //     this.removeActiveCell(neighbours[i][0])
        //   }
        // }


  // console.log(this.data.activeCells)
  }

  componentDidMount() {
    let canvas = document.getElementById('game'),
    ctx = canvas.getContext('2d');
    
    setInterval(()=>{
      if(this.state.canWidth > 0) this.draw(ctx,canvas);
    },1000)
    this.data.activeCells.push([3,1],[4,1],[3,3],[2,1])
    // ,[3,2],[2,1]
  }

  render() {
    return (
      <section id="gameWrapper">
        <canvas id="game" width={this.state.canWidth} height={this.state.canHeight}></canvas>
        <section id="options">
            <div id="size">
                Size:
                <button onClick={this.sizeHandler} className="small">50x30</button>
                <button onClick={this.sizeHandler} className="medium">70x50</button>
                <button onClick={this.sizeHandler} className="large">100x80</button>
            </div>
        </section>        
      </section>
    )
  }
}

ReactDOM.render(<Root/>, document.getElementById('app'))
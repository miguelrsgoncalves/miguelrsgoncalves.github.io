class Civilization {
  constructor(x, y) {
    this.humans = [];
    this.villages = [];
    this.resources = [];
    
    this.food = 15000;
    this.wood = 0;
    
    this.createVillage(x, y, 3);
    this.createHuman(x, y, "woodcuter");
    this.createHuman(x, y, "farmer");
    this.createHuman(x, y, "foodCarrier");
    this.createHuman(x, y, "woodCarrier");
    
    this.workCreationOrder = ["foodCarrier", "woodCarrier", "farmer", "woodcuter"];
    this.nextWork = 0;
  }
  
  endTurn() {
    if(this.food > 0) {
      if(this.humans.length > 0) {
        this.food -= this.humans.length * (1 + Math.floor(0.25 * this.humans.length));
      }
    }
    else {
      this.food = 0;
      if(this.humans.length > 0) {
        if(this.humans[this.humans.length - 1].carrying) {
          this.humans[this.humans.length - 1].carrying.pickedUp = false;
        }
        this.humans.pop();
      }
    }
    
    for (let i = civilization.resources.length - 1; i >= 0; i--) {
      const resource = civilization.resources[i];
      if (resource.droppedOff) {
        civilization.resources.splice(i, 1);
      }
    }
    
    for(let human of this.humans) {
      human.move();
    }
    
    for(let village of this.villages) {
      village.getMaxHumans();
    }
    
    if (this.food >= this.humans.length * 500 + 2500) {
      for (let village of this.villages) {
        if (village.habitants < village.maxHumans) {
          this.createHuman(village.x, village.y, this.workCreationOrder[this.nextWork]);
          this.nextWork = (this.nextWork + 1) % this.workCreationOrder.length;
          village.habitants++;
          this.food -= 2500;
          break;
        }
      }
    }

    
    if(this.wood >= 1000) {
      for(let village of this.villages) {
        if(village.habitants == village.maxHumans) {
          village.createHouse();
          this.wood -= 1000;
        }
      }
    }
  }
  
  createHuman(x, y, work) {
    this.humans.push(new Human(x, y, work));
  }
  
  createVillage(x, y, habitants) {
    this.villages.push(new Village(x, y, habitants));
  }
  
  display() { 
    for(let village of this.villages) {
      village.display();
    }
    
    for(let resource of this.resources) {
      resource.display();
    }
    
    for(let human of this.humans) {
      human.display();
    }
  }
}
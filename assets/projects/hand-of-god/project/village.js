class Village {
  constructor(x, y, habitants) {
    this.x = x;
    this.y = y;
    this.houses = [new House(this.x, this.y)];
    this.habitants = habitants;
    this.maxHumans = 0;
    this.getMaxHumans();
  }
  
  createHouse() {
    const radius = tileSize * 5;
    const houseX = this.x + int(random(-radius, radius));
    const houseY = this.y + int(random(-radius, radius));
    this.houses.push(new House(houseX, houseY));
  }
  
  getMaxHumans() {
    this.maxHumans = 4 + this.houses.length;
  }
  
  display() {
    for(let house of this.houses) {
      house.display();
    }
  }
}
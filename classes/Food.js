
/* 
Sprite Class that extends Phaser.GameObjects.Sprite
and represent the Food sprite for the simulation
*/
export default class Food extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey, speed) {
      super(scene, x, y, textureKey);
      
      // Adds the Sprite to the scene
      scene.add.existing(this);
      scene.physics.add.existing(this);

      // Gives the food a initial random direction on creation
      let angle = Math.floor(Math.random() * (360 - 0 + 1) + 0)
      const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
  
      this.body.velocity.x = direction.x * speed
      this.body.velocity.y = direction.y * speed

      /*
      Sets up collision and bounce so that the Food sprite bounces back when it
      hits a wall 
      */
      this.body.setBounce(1, 1)
      this.body.setCollideWorldBounds(true)
  
      
      // Additional setup or customization specific to the food sprite
    }
  
    // Add any custom methods or behaviors the food sprite
  }
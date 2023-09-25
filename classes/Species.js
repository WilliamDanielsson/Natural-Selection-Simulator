
/* 
The Sprite gets their attributes by a point system between 0 - 100. 100 being the max, 0 being
the lowest. 

This function converts those points for a given attribute by their individuall threasholds, so that
each attribute gets values that accurately represents their own range of values.
*/
function convertPointsToAttribute (attributeType, points) {
  const pointsMaxThreashold = 100
  switch (attributeType) {
    case "speed":
        const speedMaxThreashold = 250
        points = (points/pointsMaxThreashold) * speedMaxThreashold //Converts the points into speed values
    break;

    case "size":
      /*
      If the size points is small enough, make the size to a constant size. So
      that the Sprite cannot be too small to see on the screen. 
      */
      if(points < 10){
        points = 0.3
      } else {
        const sizeMaxThreashold = 3
        points = (points/pointsMaxThreashold) * sizeMaxThreashold //Converts the points into size values
      }
    break;

    case "vision":
      const visionMaxThreashold = 500
      points = (points/pointsMaxThreashold) * visionMaxThreashold //Converts the points into vision values
    break;

    case "stamina":
      const staminaMaxThreashold = 20000
      points = (points/pointsMaxThreashold) * staminaMaxThreashold //Converts the points into stamina values
    break;
  }

  //Return the now modified points
  return points
}

/* 
Sprite Class that extends Phaser.GameObjects.Sprite
and represent the Species sprite for the simulation

This class holds all the functionalites and methods that the Species will need to live
in the simulation. Most of the logic of the Species are located here to make the
Generation Scene classes more compact.
*/
export default class Species extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, textureKey, speciesSpriteNr, name, color, speed, size, vision, stamina) {
    super(scene, x, y, textureKey);

    this.speciesID = Date.now().toString(36) + Math.random().toString(36).substr(2); // Generate a unique ID for the sprite for potential references
    
    // adds the Sprite to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // enables collision for the sprite
    this.scene.physics.world.on('collide', this.handleCollisionWithWorldBounds, this.scene);
    this.body.setCollideWorldBounds(true)

    this.name = name
    this.textureKey = textureKey
    this.color = color
    this.setTint(this.color);
    this.speciesSpriteNr = speciesSpriteNr

    // Define the color to replace (this is for the changeColor function that is not used for the moment)
    this.colorToReplace = Phaser.Display.Color.ValueToColor(0x22FF00); // Green color

    // Define the new color to replace with (this is for the changeColor function that is not used for the moment)
    this.newColor = Phaser.Display.Color.ValueToColor(this.color); // Red color

    const initialXSnapshot = x
    this.initialX = initialXSnapshot

    const initialYSnapshot = y
    this.initialY = initialYSnapshot

    this.haveFoundFood = false
    this.isAlive = true

    this.speed = convertPointsToAttribute("speed", speed)
    this.size = convertPointsToAttribute("size", size)
    this.vision = convertPointsToAttribute("vision", vision)
    this.stamina = convertPointsToAttribute("stamina", stamina)

    this.initialSpeed = speed
    this.initialSize = size
    this.initialVision = vision
    this.initialStamina = stamina

    // All sprites is at default a bit too big, so scaling them down to match the scene better
    this.scaleX *= (0.35 * this.size);
    this.scaleY *= (0.35 * this.size);

    this.timeSpentAlive = 0

    //Tracks how long time the Sprite has been alive for
    const intervalInSeconds = 1;
    const intervalInMillis = intervalInSeconds * 1000;
    setInterval(() => {
      this.timeSpentAlive += 1000
    }, intervalInMillis);
    
    this.haveLoadedSpritesheets = false
    this.createSpriteAnimations() // Create all the different animations for the sprite by loading spritesheets
   }

  /* 
  Method that holds the behavior of the Sprite and how it will survive and find food in
  the simulation. All of the logic for the Sprite is in this method.
  */
  searchForFood (foodArray) {
    /* 
    It happens that some spritesheets takes a bit longer to load, meaning that the
    species might run around with the default texture instead of the animations. To counter this
    we re-run the createSpriteAnimations () function if the spritesheets happen to not load in time.
    */
    if(this.haveLoadedSpritesheets == false){
      this.createSpriteAnimations()
    }
    
    // If the Sprite is alive, has not found food and if there still exists food out there, then search for food
    if(this.haveFoundFood == false && foodArray.length != 0 && this.isAlive == true){
      // Check if the Sprite has died from hunger yet
      if(this.timeSpentAlive <= this.stamina){
        
        // The sprite has not died from hunger, then lets find food
        let closestFood = foodArray[0]
        let minDistance = Phaser.Math.Distance.Between(this.x, this.y, closestFood.x, closestFood.y)

        // Calculate what food sprite is the closest
        for(let i = 0; foodArray.length > i; i++){
            const distance = Phaser.Math.Distance.Between(this.x, this.y, foodArray[i].x, foodArray[i].y)
            if(distance < minDistance){
                minDistance = distance
                closestFood = foodArray[i]
            }
        }

        // Check if the closest food is within the range of the Sprite's vision.
        if(minDistance < this.vision && this.haveFoundFood == false){   
            // The food is in the range of the Sprite's vision
          
            const direction = new Phaser.Math.Vector2(closestFood.x - this.x, closestFood.y - this.y); // Calculate the direction needed to move towards the food

            direction.normalize(); // Normalize the direction vector to get a unit vector

            // Set the velocity (movement speed) of the sprite
            this.body.velocity.x = direction.x * this.speed;
            this.body.velocity.y = direction.y * this.speed;

            // Check if the sprite has collided with the closestFood, using Phasers' physics.add.collider function
            this.scene.physics.add.collider(this, closestFood, () => {
              /*
              This function fires if a collision has happend between the sprite (this) 
              and the closest food (closetFood) and also checks if the Sprite have found food before.

              If the Sprite has not found any food beforehand then it will change [this.haveFoundFood] to [true], and also destroy
              both the Food and the Sprite so that it does not occupy any data to cause Data-Leaks.
              */ 
              if(this.haveFoundFood == false){
                this.haveFoundFood = true
                this.play(`eating-${this.speciesSpriteNr}`) // Play the eating animation
                closestFood.destroy();
                foodArray.splice(foodArray.indexOf(closestFood), 1);

                // Delay the execution of this code below by 1 second so that the eating animation can go on for a little while
                this.scene.time.delayedCall(1000, () => {
                  this.destroy();
                }, [], this);
              }
            });
           
        } else if(minDistance >= this.vision && this.haveFoundFood == false){ // If the closest food is not in range of the Sprites vision

            // Randomly change direction every 1 - 4 seconds
            if (!this.lastDirectionChangeTime || this.scene.time.now - this.lastDirectionChangeTime >= this.directionChangeInterval) {
                this.lastDirectionChangeTime = this.scene.time.now;

                this.directionChangeInterval = Math.floor(Math.random() * (4000 - 1000 + 1) + 1000); // Random interval between 1 to 4 seconds
                
                const angle = Phaser.Math.RND.angle(); // Generate a random angle
                
                const direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));  // Apply the angle to a 2d Vector

                direction.normalize(); // Normalize the direction vector to get a unit vector

                this.body.velocity.x = direction.x * this.speed;
                this.body.velocity.y = direction.y * this.speed;
              }

            /* 
            Since the Sprite is now moving randomly, if might happen that it runs straight into a wall. 
            The Sprite should be able to tell when it moves into a wall.

            So this method is being called to see if the Sprite has hit a wall, and if so, change the direction so that
            it no longer is facing the wall.
            */
            this.handleCollisionWithWorldBounds();

            // Check if the sprite has collided with the closestFood, using Phasers' physics.add.collider function
            this.scene.physics.add.collider(this, closestFood, () => {
              /*
                This function fires if a collision has happend between the sprite (this) 
                and the closest food (closetFood) and also checks if the Sprite have found food before.

                If the Sprite has not found any food beforehand then it will change [this.haveFoundFood] to [true], and also destroy
                both the Food and the Sprite so that it does not occupy any data to cause Data-Leaks.
              */ 
              if(this.haveFoundFood == false){
                this.haveFoundFood = true
                this.play(`eating-${this.speciesSpriteNr}`) // Play the eating animation
                closestFood.destroy();
                foodArray.splice(foodArray.indexOf(closestFood), 1);

                // Delay the execution of this code below by 1 second so that the eating animation can go on for a little while
                this.scene.time.delayedCall(1000, () => {
                  this.destroy();
                }, [], this);
              }
            });
        }
      } else { // If the Sprite has been alive longer than its Stamina, and still has not found any food

        /* 
        Kill the sprite by changing its alive attribute to [false], changing its color to black, and start a 
        death animation.
        */
        this.isAlive = false
        this.body.velocity.x = 0
        this.body.velocity.y = 0

        this.play(`death-${this.speciesSpriteNr}`); // Play the death animation

        // Let the Death animation play out before executing the rest of the code
        this.once('animationcomplete', (animation, frame) => { // (dont know if the "frame" variable is even neccesarry)
          if (animation.key === `death-${this.speciesSpriteNr}`) { 
            // The death animation has finished playing, now play the ghostDeath animation
            this.clearTint(); // All ghosts have the same color, so clear the tint for the species before playing the ghost animation
            this.play(`ghostDeath-${this.speciesSpriteNr}`); // Play the ghost animation
            this.body.velocity.y = -10 // Change the y-velocity so that the ghost appears to slowly float upwards

            const duration = 1800; // Duration of the fade-out effect in milliseconds
            // Phaser Scene function to create fade-out animations on the Sprite
            this.scene.tweens.add({
              targets: this,
              // Tell the function to fade the sprite out all the way to transparent
              alpha: 0,
              duration: duration,
              
              onComplete: () => {
                // This function will be called once the fade-out is complete
                this.destroy(); // Destroy the sprite after the fade-out is complete
              },
            });
          }
        });
      }
    } else if(foodArray.length == 0 && (this.haveFoundFood == false && this.isAlive == true)){ // If the Sprite is still alive but all the food has run out
          /* 
          Kill the sprite by changing its alive attribute to [false], changing its color to black
          and Destroying the Sprite in Phaser
          */
          this.isAlive = false
          this.body.velocity.x = 0
          this.body.velocity.y = 0
          this.setTint(`0x000000`); // Set the tint color to white
          this.destroy(); // Destroy the sprite
    }
  }

   /* 
    Method to check if the sprite has collided with the world bounds using [this.body.blocked],
    and if it have, change its direction to a direction where
    it can freely move, depending on what Wall it hit.
    */
  handleCollisionWithWorldBounds () {
    if(this.body.blocked.left){
        this.body.velocity.x = 1 * this.speed
        this.body.velocity.y = 0
    } else if(this.body.blocked.up){
        this.body.velocity.x = 0
        this.body.velocity.y = 1 * this.speed
    } else if(this.body.blocked.right){
        this.body.velocity.x = -1 * this.speed
        this.body.velocity.y = 0
    } else if(this.body.blocked.down){
        this.body.velocity.x = 0
        this.body.velocity.y = -1 * this.speed
    }
  }

  /* 
  The initial Sprites should all be spawned at the edges of the Scene. This to make the
  simulation more fare. 

  Also, every Species should have unique locations so that they are spread out.

  This Method gives a Species a random location at one of the four edges. And then checks if that location
  is free. If it is occupied by any other Species, then a new location is generated until a valid poisiton is found.
  */
  generateValidPosition (speciesArray) {
    let speciesXPosition = null
    let speciesYPosition = null

    // Find a random location at one of the four Edges of the Simulation.
    const randomEdge = Math.floor(Math.random() * (4 - 1 + 1) + 1)
    switch (randomEdge) {
        case 1:
            speciesXPosition = 0
            speciesYPosition = Math.floor(Math.random() * (this.scene.height - 0 + 1) + 0)  
            break;
        case 2:
            speciesXPosition = Math.floor(Math.random() * (this.scene.width - 0 + 1) + 0)
            speciesYPosition = 0 
            break;
        case 3:
            speciesXPosition = this.scene.width
            speciesYPosition = Math.floor(Math.random() * (this.scene.height - 0 + 1) + 0)  
            break;
        case 4:
            speciesXPosition = Math.floor(Math.random() * (this.scene.width - 0 + 1) + 0)
            speciesYPosition = this.scene.height 
            break;
        default:
            speciesXPosition = 0
            speciesYPosition = 0
      }
    
    // Makes sure that the position is unique for every species by using a Do While Loop
    let positionAlreadyExists = false
    do {
        positionAlreadyExists = false
        for(let i = 0; i < speciesArray.length; i++){
            if(speciesXPosition == speciesArray[i].x && speciesYPosition == speciesArray[i].y){
                positionAlreadyExists = true
            }
        }

        // Generate a new random location at one of the edges
        const randomEdge = Math.floor(Math.random() * (4 - 1 + 1) + 1)
        switch (randomEdge) {
            case 1:
                speciesXPosition = 0
                speciesYPosition = Math.floor(Math.random() * (this.scene.height - 0 + 1) + 0)  
                break;
            case 2:
                speciesXPosition = Math.floor(Math.random() * (this.scene.width - 0 + 1) + 0)
                speciesYPosition = 0 
                break;
            case 3:
                speciesXPosition = this.scene.width
                speciesYPosition = Math.floor(Math.random() * (this.scene.height - 0 + 1) + 0)  
                break;
            case 4:
                speciesXPosition = Math.floor(Math.random() * (this.scene.width - 0 + 1) + 0)
                speciesYPosition = this.scene.height 
                break;
        }
    } while (positionAlreadyExists == true) // If the generated location is already occupied, then generate a new random location at one of the edges until a valid position is found

    this.x = speciesXPosition
    this.y = speciesYPosition

    //set the inital positions as well, for making it easy to get appriporiate positions for new generations species (Childs)
    this.initialX = speciesXPosition
    this.initialY = speciesYPosition
  }

  /* 
  Method that creates all the animations for the Species sprite

  Loads in all the required spritesheets depending on the Species [this.speciesSpriteNr]
  and creates all the animations by using the CreateAnimations method.

  To save data, only one set of spritesheets are loaded into Phaser for each family of species. 
  Meaning that all species in the same family use the same set of spritesheets 
  and is only loaded into Phaser once
  */
  createSpriteAnimations () {
    // Define the frame variables and give them default values
    let nrOfWalkingFrames = 3
    let nrOfEatingFrames = 3
    let nrOfDeathFrames = 3
    let nrOfGhostFrames = 7

    // Some specific species spritesheets have extra subimages/frames so change them if it is a sprite that has this
    if(this.speciesSpriteNr == 5){
      nrOfWalkingFrames = 4
    } else if(this.speciesSpriteNr == 7){
      nrOfDeathFrames = 4
    } else if(this.speciesSpriteNr == 8){
      nrOfWalkingFrames = 2
      nrOfEatingFrames = 2
      nrOfDeathFrames = 2
    }
        
    /* To save data usage we only load in a spritesheet if it is unique, and otherwise re-use the spritesheet
    for all the same species so that the specific spritesheet only needs to be loaded once for each family of species */
    const walkingKey = `spriteMove-${this.speciesSpriteNr}`;
    const eatingKey = `spriteEating-${this.speciesSpriteNr}`;
    const deathKey = `spriteDeath-${this.speciesSpriteNr}`;
    const ghostDeathKey = `ghostDeath-${this.speciesSpriteNr}`;
    
    if ( // If all the animations for the spritesheet already exists, then re-use them
      this.scene.textures.exists(walkingKey) &&
      this.scene.textures.exists(eatingKey) &&
      this.scene.textures.exists(deathKey) &&
      this.scene.textures.exists(ghostDeathKey)
    ) {
      // The spritesheets are already loaded, create the animations directly
      this.createAnimations(`move-${this.speciesSpriteNr}`, walkingKey, 10, -1, nrOfWalkingFrames);
      this.createAnimations(`eating-${this.speciesSpriteNr}`, eatingKey, 10, -1, nrOfEatingFrames);
      this.createAnimations(`death-${this.speciesSpriteNr}`, deathKey, 4, 0, nrOfDeathFrames);
      this.createAnimations(`ghostDeath-${this.speciesSpriteNr}`, ghostDeathKey, 6, -1, nrOfGhostFrames);

      this.play(`move-${this.speciesSpriteNr}`); // Start the move animation
      this.haveLoadedSpritesheets = true // Change the flag that is used in the searchForFood method
    } else { // If the spritesheets are unique, then load them into Phaser manually

      //Create a img of the Sprite for dimension references
      const img = new Image(); // Create a new Image object
      img.src = `assets/sprites/Species-${this.speciesSpriteNr}.png`; // Set the src attribute to the sprite image URL

      // Set the onload event to create all the animations once the image has finished loading
      let imageHeight = undefined;
      img.onload =  ()  => {

        imageHeight = img.height; // Get the height of the sprite img reference
    
        // Load all the different spritesheets
        this.scene.load.spritesheet(`spriteMove-${this.speciesSpriteNr}`, `assets/sprites/spritesheets/Species-${this.speciesSpriteNr}-WalkingAnimation.png`, { frameWidth: 100, frameHeight: imageHeight });
        this.scene.load.spritesheet(`spriteEating-${this.speciesSpriteNr}`, `assets/sprites/spritesheets/Species-${this.speciesSpriteNr}-EatingAnimation.png`, { frameWidth: 100, frameHeight: imageHeight });
        this.scene.load.spritesheet(`spriteDeath-${this.speciesSpriteNr}`, `assets/sprites/spritesheets/Species-${this.speciesSpriteNr}-DeathAnimation.png`, { frameWidth: 100, frameHeight: imageHeight });
        this.scene.load.spritesheet(`ghostDeath-${this.speciesSpriteNr}`, "assets/sprites/spritesheets/Ghost-DeathAnimation.png", { frameWidth: 100, frameHeight: 148 });

        this.scene.load.start(); // Tell the scene that everything has been loaded and let the scene generate them
      
        this.scene.load.once('complete', () => { // When the scene has loaded everthing, create the different animations for the different spritesheets
          this.createAnimations(`move-${this.speciesSpriteNr}`, `spriteMove-${this.speciesSpriteNr}`, 10, -1, nrOfWalkingFrames);
          this.createAnimations(`eating-${this.speciesSpriteNr}`, `spriteEating-${this.speciesSpriteNr}`, 10, -1, nrOfEatingFrames);
          this.createAnimations(`death-${this.speciesSpriteNr}`, `spriteDeath-${this.speciesSpriteNr}`, 4, 0, nrOfDeathFrames);
          this.createAnimations(`ghostDeath-${this.speciesSpriteNr}`, `ghostDeath-${this.speciesSpriteNr}`, 6, -1, nrOfGhostFrames);

          this.play(`move-${this.speciesSpriteNr}`); // Start the move animation
          this.haveLoadedSpritesheets = true // Change the flag that is used in the searchForFood method
        }, this);
      };  
    }
  }

  /* 
  Create a animation for the scene where a spritesheet is selected, as well
  as the different parameters such as nr of frames, amount of repeats, the animation key and so on
  */
  createAnimations(animationKey, spriteSheet, framerate, repeats, nrOfFrames) {
    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNumbers(spriteSheet, { start: 0, end: (nrOfFrames - 1) }),
      frameRate: framerate,
      repeat: repeats
    });
  }

  /* 
  Magical code from Chat-GPT that manually switches a specific color of a sprite to another color.
  and also only does this once for every unique instance. So sprites of the same family can re-use their
  textures which means that this process dont need to be re-done for every sprite which saves alot
  of data and also processing time!

  Only works on textures, and not on spritesheets! (is therefor not used at the moment)
  */
  changeColor () {
    const cacheKey = `${this.texture.key}-${this.colorToReplace.red}-${this.colorToReplace.green}-${this.colorToReplace.blue}-${this.newColor.red}-${this.newColor.green}-${this.newColor.blue}`;
  
    // Check if the modified texture already exists in the cache
    if (this.scene.textures.exists(cacheKey)) {
      // Use the cached texture if available
      this.setTexture(cacheKey);
    } else {
      const sourceTexture = this.scene.textures.get(this.texture.key);
      const sourceImage = sourceTexture.getSourceImage();
  
      // Create a new canvas and context
      const canvas = document.createElement('canvas');
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;
      const ctx = canvas.getContext('2d');
  
      // Draw the source image on the canvas
      ctx.drawImage(sourceImage, 0, 0);
  
      // Get the image data of the canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
  
      // Loop through each pixel and replace the color
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
  
        if (r === this.colorToReplace.red && g === this.colorToReplace.green && b === this.colorToReplace.blue) {
          data[i] = this.newColor.red;
          data[i + 1] = this.newColor.green;
          data[i + 2] = this.newColor.blue;
        }
      }
  
      // Put the modified image data back to the canvas
      ctx.putImageData(imageData, 0, 0);
  
      // Create a new texture from the modified canvas
      const modifiedTexture = this.scene.textures.addCanvas(cacheKey, canvas);
  
      // Wait for the modified texture to finish loading
      this.scene.events.once('texturesloaded', () => {
        // Set the new texture for the sprite
        this.setTexture(cacheKey);
      });
  
      // Refresh the modified texture
      modifiedTexture.refresh();
    }
  }
}
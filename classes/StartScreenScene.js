import Food from "./Food.js";

/* 
Class that renders the scene that is the background for the start screen
Renders a grassfield of the screen size and also renders some Foods that float around
*/
export default class StartScreenScene extends Phaser.Scene {
    amountOfFoods;
    constructor(width, height) { 
        let sceneID = Date.now().toString(36) + Math.random().toString(36).substr(2);
        super(sceneID);

        this.width = width;
        this.height = height; 
    }

    // Assets to load in before the render
    preload() { 
        this.load.image('grass', 'assets/sprites/grass.png');
        this.load.image('food', 'assets/sprites/FoodSprite.png');
    }

    // Create the initial assets for this scene
    create() {
        this.RenderTheBackground(this.width, this.height)

        const numberOfFoods =  100
        
        // Creates the Food sprites and put them into a array called [foodArray]
        for(let i = 0; numberOfFoods > i; i++){
            const foodXPosition = Math.floor(Math.random() * (this.width - 0 + 1) + 0) // Give the food a random X-position within the WorldBounds
            const foodYPosition = Math.floor(Math.random() * (this.height - 0 + 1) + 0) // Give the food a random Y-position within the WorldBounds
            
            const speed = 25 // Velocity of the food

            const food = new Food(this, foodXPosition, foodYPosition, 'food', speed);
        }
    }

    // The core gameplay loop for this scene, running 60 times per second.
    update() {
        // Empty cause nothing has to be updated
    }

    /* 
    Method that renders the grass background dynamically.
    The background image is of a constant size, so multiple amount of grass images have to be
    created to fill the entire area of the scene depending on the scenes size.

    This method takes in the width and height of the scene and renders as many background
    sprites as needed to fill the entire background.
    */
    RenderTheBackground (width, height){
        let referenceGrass = this.add.image(0, 0, 'grass') // This image is used as reference to get the Width and Height of the image at demand

        /* Calculates how many times the image fits on the height, rounds it up so that it wont undershoot the amount of images needed.
        +1 is for when the width is slightly larger than the amount of images that fit on the scene. */
        let heightNrOfTimes = Math.ceil(height/referenceGrass.displayHeight) + 1

         // Creates background images to the size of the column (height)
         let summarizedHeight = 0
        for(let i = 0; i < heightNrOfTimes; i++){

            /* Calculates how many times the image fits on the width, rounds it up so that it wont undershoot the amount of images needed.
            +1 is for when the width is slightly larger than the amount of images that fit on the scene. */
            let widthNrOfTimes = Math.ceil(width/referenceGrass.displayWidth)

            // Creates background images to the size of the row (width)
            let summarizedWidth = 0
            for(let i = 0; i < widthNrOfTimes + 1; i++){
                const grass = this.add.image(summarizedWidth, summarizedHeight, 'grass')
                summarizedWidth += referenceGrass.displayWidth
            }
            summarizedHeight += referenceGrass.displayHeight
        }
    }
}
import Species from "./Species.js"
import Food from "./Food.js"

/* 
Math function that creates a random value between two values, chosen in regards to Normal Distribution
(meaning that the chances of getting values at either edge of the span is less likely, 
and getting values at the middle of the span is more likely.)
*/
function getRandomValueInRangeWithNormalDistribution (min, max) {
    const range = max - min;
    const u1 = 1 - Math.random(); // Uniform random variable 1
    const u2 = 1 - Math.random(); // Uniform random variable 2
    const stdDeviation = range / 6; // Standard deviation (adjust as desired)
    const mean = min + range / 2; // Mean value
  
    // Box-Muller transform to convert uniform random numbers to normal distribution
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = mean + z0 * stdDeviation;
  
    // Ensure the generated value is within the specified range
    return Math.min(Math.max(value, min), max);
  }

  /* 
  Generation class that extends Phaser.Scene and that holds the scene
  that that all the generations (except the first one) is created in.

  This class instanciates the scene and creates the Food sprites and inherit the surviving Species from the previous Generation, and
  creates a new array with the survivors as well as creating new Species from the survivors (children) that have their attributes and positions
  based on their parent (the survivors) but with slight mutations to increase or decrease the Species performance.

  When this Generation is over, another instance of Next Generation is created where the next generation will play out in the same way.
  */
export default class NextGeneration extends Phaser.Scene {
    constructor(width, height, incomingSurvivorsSpeciesArray, incomingGenerationNumber, nrOfFoods, mutation) {
        // Gives the Generation a unique ID that Phaser demands.
        let sceneID = Date.now().toString(36) + Math.random().toString(36).substr(2);
        super(sceneID);

        this.width = width
        this.height = height

        this.nrOfFoods = nrOfFoods

        this.mutation = mutation

        this.generationNumber = incomingGenerationNumber
        this.incomingSurvivorsSpeciesArray = incomingSurvivorsSpeciesArray
        this.survivorsSpeciesArray = []
        this.initialSpeciesArray = []
        this.haveEndedSimulation = false

        this.speciesArray = []
        this.foodArray = []

        this.arrayOfSpeciesFamilies = []

        this.speciesScoreboard = document.getElementById('speciesScoreboard') // Get the HTML element of the scoreboard
        this.scoreboardEntriesArray = []

        this.haveUpdatedScoreboardElements = false // Flag to make sure we only update the scoreboard once per generation

        /*
        Code for the HTML elements below
        */
        const generationNumberHTML = document.getElementById('generationNumber'); // Get the HTML element of the generation number
        generationNumberHTML.textContent = `${this.generationNumber}`; // Change the HTML of the generation number heading in index.html file

        // Style the pause button dynamically
        const pauseButtonHTML = document.getElementById('pauseButton'); // Get the HTML element of the pause Button
        pauseButtonHTML.style.display = 'block'
        pauseButtonHTML.style.left = `${width - 40}px`

        // Style the pause button image dynamically
        let pauseButtonImageHTML = document.getElementById('pauseButtonImage'); // Get the HTML element of the pause Button image
        pauseButtonImageHTML.style.display = 'block'
        pauseButtonImageHTML.setAttribute('src', '../assets/Paus.png'); // Make sure that the Paus image is always displayed as default at the start

        // Javascript listener for the pause game button, when clicked, the simulation is paused
        this.isPaused = false
        pauseButton.addEventListener('click', () => {
            if (this.isPaused == true) {
                this.isPaused = false;
                pauseButtonImageHTML.setAttribute('src', '../assets/Paus.png'); // Change the src attribute
                this.scene.resume(); // Pause the current scene
            } else if (this.isPaused == false) {
                this.isPaused = true;
                pauseButtonImageHTML.setAttribute('src', '../assets/Start.png'); // Change the src attribute
                this.scene.pause(); // Pause the current scene
            }
        });

    }

    // Assets to load in before the render
    preload () {
        this.load.image('grass', 'assets/sprites/grass.png');
        this.load.image('food', 'assets/sprites/FoodSprite.png');
    }

    // Create the initial assets for this scene
    create () {
        this.RenderTheBackground(this.width, this.height) // Render the grass background dynamically

        this.startGeneration() // Creates the Species and Food sprites that will be used in this Generation Scene

        this.createScoreboard() // Create the scoreboard/leaderboard by grouping all the Species and calculating their scores and population size
    }

    // The core gameplay loop for this scene, running 60 times per second.
    update () {
        /* 
        The Sprite images in the scoreboards takes a inconsistent amount of time to load.
        Which result in the order of the scoreboard list to be different from each time. 
        To consistently get the scoreboard elements to be ordered correctly we wait
        for all the image elements to finish loading (this.scoreboardEntriesArray.length == 10, or
        if less then 10 species are left, then check that it is the same length as all of the number 
        of different species that are left)
        After that we can sort the entries again since they will have been disorganized again.
        And then finally we insert them into the scoreboard html element.
        */
        if((this.scoreboardEntriesArray.length == 10 || this.scoreboardEntriesArray.length == this.arrayOfSpeciesFamilies.length) && this.haveUpdatedScoreboardElements == false){
            this.haveUpdatedScoreboardElements = true

            this.scoreboardEntriesArray.sort((a, b) => a.placeSnapshot - b.placeSnapshot); // Sort the array from smallest to biggest in regard to their place variable
            this.insertElementsInScoreboardHTML() // Finally inserts the elements into the scoreboard
        }

         /* 
        Looks if all Species have died, and if so change [shouldEndSimulation] to [true]
        */
        let hasCheckedOnce = false
        let shouldEndSimulation = null
        for(let i = 0; this.speciesArray.length > i; i++){
           this.speciesArray[i].searchForFood(this.foodArray);

           if(this.speciesArray[i].isAlive == true && this.speciesArray[i].haveFoundFood == false && hasCheckedOnce == false){
                shouldEndSimulation = false
                hasCheckedOnce = true // Makes sure this code only runs once
           }
        }

        /*
       If all the food is gone, or if all the Species are dead ([shouldEndSimulation] is set to true):
       Then end this scene and start the next generation where the survivors of this generation gets put in
       a array called [survivorsSpeciesArray] that then gets put into the Next Generation where the surviving
       species get to live on in.
       */
        if((this.foodArray.length == 0 || shouldEndSimulation != false) && this.haveEndedSimulation == false){
            this.haveEndedSimulation = true // Makes sure this code only runs once
            // Checks which of the Species survived and add them to a separate array called [survivorsSpeciesArray]
            for(let i = 0; this.speciesArray.length > i; i++){
                if(this.speciesArray[i].isAlive == true && this.speciesArray[i].haveFoundFood == true){
                    this.survivorsSpeciesArray.push(this.speciesArray[i])
                    this.speciesArray[i].destroy() // Destroy the sprite to free memory
                }
             }
            /* 
            If there was atleast one surviving Species from this Generation:
            Create the next generation called NextGeneration and add the [survivorsSpeciesArray]
            to that scene, as well as some other information.
            */
             if(this.survivorsSpeciesArray.length != 0){
                let nextGenerationNumber = this.generationNumber + 1
                let nextGeneration = new NextGeneration(this.width, this.height, this.survivorsSpeciesArray, nextGenerationNumber, this.nrOfFoods, this.mutation)

                this.scene.remove('nextGeneration') // Removes the scene to free memory
                this.scene.add('nextGeneration', nextGeneration, true); // Add the Next Generation scene
                this.scene.start('nextGeneration'); // Start the Next Generation scene
             }
        }
    }

    /* 
    Method that instanciates the Food and Species sprites and puts them in a
    foodArray and speciesArray.
    */
    startGeneration () {

        /* 
        Creates clones of the surviving parents Species, and generate 1-4 child Species that have attributes 
        based on their parents, but with slight mutations. Then put both the parent Species and child Species into a array called [speciesArray]  
        */
        for(let i = 0; i < this.incomingSurvivorsSpeciesArray.length; i++){

            // Create a new Species that have the same attributes as the surviving species.
            const species = new Species(this, this.incomingSurvivorsSpeciesArray[i].initialX, this.incomingSurvivorsSpeciesArray[i].initialY, this.incomingSurvivorsSpeciesArray[i].textureKey, this.incomingSurvivorsSpeciesArray[i].speciesSpriteNr, this.incomingSurvivorsSpeciesArray[i].name, this.incomingSurvivorsSpeciesArray[i].color, this.incomingSurvivorsSpeciesArray[i].initialSpeed, this.incomingSurvivorsSpeciesArray[i].initialSize, this.incomingSurvivorsSpeciesArray[i].initialVision, this.incomingSurvivorsSpeciesArray[i].initialStamina)
            this.speciesArray.push(species)

            let nrOfChilds = Math.floor(getRandomValueInRangeWithNormalDistribution(1, 4)) // Decide 1-4 number of childs at random
            for(let j = 0; j < nrOfChilds; j++){
                let maxMutation = 1 + this.mutation
                let minMutation = 1 - this.mutation

                // Mutate the Parents' attributes by a random fraction within a range, in regards to Normal Distribution
                let mutatedSpeed = this.incomingSurvivorsSpeciesArray[i].initialSpeed * getRandomValueInRangeWithNormalDistribution(minMutation, maxMutation)
                let mutatedSize = this.incomingSurvivorsSpeciesArray[i].initialSize * getRandomValueInRangeWithNormalDistribution(minMutation, maxMutation)
                let mutatedVision = this.incomingSurvivorsSpeciesArray[i].initialVision * getRandomValueInRangeWithNormalDistribution(minMutation, maxMutation)
                let mutatedStamina = this.incomingSurvivorsSpeciesArray[i].initialStamina * getRandomValueInRangeWithNormalDistribution(minMutation, maxMutation)
    
                let newPositionsCloseToParent = this.generateValidPositionForChildSpecies(this.incomingSurvivorsSpeciesArray[i]) // Generate positions for the Child Species that are close to its Parent
                
                // Create the Child Species with its mutated attributes and new positions
                const species = new Species(this, newPositionsCloseToParent.newSpeciesXPosition, newPositionsCloseToParent.newSpeciesYPosition, this.incomingSurvivorsSpeciesArray[i].textureKey, this.incomingSurvivorsSpeciesArray[i].speciesSpriteNr, this.incomingSurvivorsSpeciesArray[i].name, this.incomingSurvivorsSpeciesArray[i].color, mutatedSpeed, mutatedSize, mutatedVision, mutatedStamina)
                this.speciesArray.push(species)
            }
        } 

        this.initialSpeciesArray = [...this.speciesArray]; // Deep copy of the array

        // Calculates how many Food Sprites should be created
        const foodDeviation = 0.8
        const maxNumberOfFoods = this.nrOfFoods * foodDeviation;
        const minNumberOfFoods = maxNumberOfFoods * foodDeviation;
        const numberOfFoods = Math.floor(Math.random() * (maxNumberOfFoods - minNumberOfFoods + 1) + minNumberOfFoods) // Generate x amount of Food that are in the range between max and min number of foods

        // Creates the Food sprites and put them into a array called [foodArray]
        for(let i = 0; numberOfFoods > i; i++){
            const foodXPosition = Math.floor(Math.random() * (this.width - 0 + 1) + 0) // Give the food a random X-position within the WorldBounds
            const foodYPosition = Math.floor(Math.random() * (this.height - 0 + 1) + 0) // Give the food a random Y-position within the WorldBounds

            const speed = 25 // Velocity of the food

            const food = new Food(this, foodXPosition, foodYPosition, 'food', speed);

            this.foodArray.push(food)
        }
    }

    /* 
    Method that calculates how many Species of each kind is alive and ranking the species 
    on their population size. Also calculates the average score of the Species families attributes and
    displays the attribute together with the ranking on a scoreboard.
    */
    createScoreboard () {
        let copyOfInitialSpeciesArray = [...this.initialSpeciesArray]; // Make a Deep Copy of the array
        while(copyOfInitialSpeciesArray.length != 0){ // Run the loop while the copy array still has entries
            let speciesFamily = [] // Create a speciesFamily array that will hold all the Species of the same kind
            
            // Select a random species from the array
            let randomIndex = Math.floor(Math.random() * copyOfInitialSpeciesArray.length)
            let randomSelectedSpecies = copyOfInitialSpeciesArray[randomIndex]

            copyOfInitialSpeciesArray.splice(randomIndex, 1) // Remove the Species from the array so that it cannot be selected again
            speciesFamily.push(randomSelectedSpecies) // Push the selected Species into the family array
            
            /* Iterate over all Species in the deep copy of the initial species array
            and check if any more Species have the same color and name (they belong to the same family)
            as the randomly selected species. And if so, put them in the Family Species array
            */
            for (let i = copyOfInitialSpeciesArray.length - 1; i >= 0; i--) { // Iterates over the loop in reverse order so removing elements does not affect the amount of times this code runs
                if(copyOfInitialSpeciesArray[i].name == randomSelectedSpecies.name && copyOfInitialSpeciesArray[i].color == randomSelectedSpecies.color){
                    speciesFamily.push(copyOfInitialSpeciesArray[i])
                    copyOfInitialSpeciesArray.splice(i, 1) // Remove the Species so that it cannot be found in the search again
                }
            }
            this.arrayOfSpeciesFamilies.push(speciesFamily) // Push the whole family into a array containing all the families of Species
        }

        let speciesScoreboardImage = document.getElementById('scoreboardImage') // Get the HTML element of the speciesScoreboard image
        
        const computedStyle = window.getComputedStyle(speciesScoreboardImage);
        const scoreboardLeft = computedStyle.getPropertyValue('left'); // Get the left value of the HTML element
        const scoreboardLeftValue = parseFloat(scoreboardLeft);

        const scoreboardTop = computedStyle.getPropertyValue('top'); // Get the top value of the HTML element
        const scoreboardTopValue = parseFloat(scoreboardTop); // Change the float into an integer

        // Change the CSS of the scoreboard dynamically
        this.speciesScoreboard.style.left = `${scoreboardLeftValue + 70}px`
        this.speciesScoreboard.style.top = `${scoreboardTopValue + 75}px`

        // Create all the list elements for the scoreboard
        if (this.arrayOfSpeciesFamilies.length != 0) {
            this.speciesScoreboard.innerHTML = "";  // Clear the existing content

            let place = 1 // The first element will have nr 1 as its ranking, the second nr 2 and so on...
            this.arrayOfSpeciesFamilies.sort((a, b) => b.length - a.length); // Sort the array from biggest to smallest to have the highest population family be at the top
            this.arrayOfSpeciesFamilies.forEach(speciesFamily => { 
                // Iterate over the Species Families array and create <li> elements for the top 10 species families
                if(place <= 10){
                    // Calculate the average score of each attribute for the selected family
                    let averageSpeed = 0
                    let averageSize = 0
                    let averageVision = 0
                    let averageStamina = 0
                    for(let i = 0; i < speciesFamily.length; i++){
                        averageSpeed += Math.floor(speciesFamily[i].initialSpeed)
                        averageSize += Math.floor(speciesFamily[i].initialSize)
                        averageVision += Math.floor(speciesFamily[i].initialVision)
                        averageStamina += Math.floor(speciesFamily[i].initialStamina)
                    }

                    averageSpeed = Math.floor(averageSpeed/speciesFamily.length)
                    averageSize = Math.floor(averageSize/speciesFamily.length)
                    averageVision = Math.floor(averageVision/speciesFamily.length)
                    averageStamina = Math.floor(averageStamina/speciesFamily.length)

                    // Create a element for the Species Family list entry
                    const li = document.createElement('li'); // Create a empty list entry
                    li.style.display = "flex"

                    // Fill the list entry with the Family name, population (species.length) and its average attributes and change the color to its Family color
                    li.textContent = `Place ${place}: ${speciesFamily[0].name} | Population: ${speciesFamily.length} | Speed: ${averageSpeed} | Size: ${averageSize} | Vision: ${averageVision} | Stamina: ${averageStamina}`
                    li.style.color = "#" + speciesFamily[0].color.substring(2);


                    // Create a element for the Species Sprite image
                    const imgElement = document.createElement('img'); // Create a image element
                    imgElement.src = `./assets/sprites/Species-${speciesFamily[0].speciesSpriteNr}.png`; // Set the source to the Species Sprite

                    // Take a snapshot of what the place is at this current time, will be used in the onload function
                    // of the imgElement
                    let placeSnapshot = place

                    // Wait for the image to load before modifying it further
                    imgElement.onload = () => {
                        /* Create a new image that looks the same as [imgElement]
                        but that have its colors modified to the Species own color
                        and then insert it into the scoreboard */
                        const RGBvalue = this.hexToRGB(speciesFamily[0].color) // Convert the HEX value to RBG for the changeColor function
                        const modifiedCanvas = this.changeColorWithRGB(imgElement, RGBvalue.r, RGBvalue.g, RGBvalue.b); // Change the color to the Species Family color

                        const dataURL = modifiedCanvas.toDataURL(); // Convert the modified canvas to a data URL

                        const modifiedImage = new Image(); // Create a new Image element for the modified image

                        modifiedImage.src = dataURL; // Set the src attribute to the data URL

                        // Set the CSS for the Image (the image is created here, so the CSS does not exist in the style.css file, therefor it is set here instead)
                        modifiedImage.style.width = "20px";
                        modifiedImage.style.height = "20px";
                        modifiedImage.style.position = "absolute";
                        modifiedImage.style.marginTop = "-20px";
                        modifiedImage.style.marginLeft = "-30px";
                        modifiedImage.style.display = "flex";

                        /* 
                        This imgElement.onload function will have a inconsistent execution time. Resulting in the scoreboard entries to
                        be created in different orders, even though they were sorted from biggest to smallest.
                        To combat this we add all the entries to a global array called [this.scoreboardEntriesArray]
                        where we will add the entries to the scoreboard once all images have finished loading.
                        This is checked at the top of the update() function. 
                        */
                        let scoreboardEntry = { placeSnapshot, li, modifiedImage } // Create a object that have the place snapshot and the entry info
                        this.scoreboardEntriesArray.push(scoreboardEntry) // Push it into the array of all scoreboardEntries
                      };

                    place++
                } 
            });
        }
    }

    /* 
    Method that appends (inserts) the scoreboardEntries info and img elements
    into the Scoreboards HTML context. 
    */
    insertElementsInScoreboardHTML () {
        // Insert all the scoreboardEntries into the scoreboard html element in the order they are in
        for(let i = 0; i < this.scoreboardEntriesArray.length; i++){
            this.speciesScoreboard.appendChild(this.scoreboardEntriesArray[i].li); // append (insert) the list entry with the Species Family info
            this.speciesScoreboard.appendChild(this.scoreboardEntriesArray[i].modifiedImage); // Append (insert) the modified image to the scoreboard
        }
    }

    /* 
    Method that renders the grass background dynamically.
    The background image is of a constant size, so multiple amount of grass images have to be
    created to fill the entire area of the scene depending on the scenes size.

    This method takes in the width and height of the scene and renders as many background
    sprites as needed to fill the entire background.
    */
    RenderTheBackground (width, height) {
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

    //Method to spawn the new child species within a radius of its parent
    generateValidPositionForChildSpecies (parentSpecies) {
    
        const radius = parentSpecies.width * 2 // Set a radius that is twice the length of the parent species's width

        let angle = Math.random() * 2 * Math.PI; // Generate a random angle

        let distance = Math.random() * radius; // Generate a random distance within the radius
        let offsetX = Math.cos(angle) * distance; // Create a x-coordinate position of the random angle and random distance within the radius
        let offsetY = Math.sin(angle) * distance; // Create a y-coordinate position of the random angle and random distance within the radius

        let newSpeciesXPosition = parentSpecies.initialX + offsetX; // Add the offset to the parent x position
        let newSpeciesYPosition = parentSpecies.initialY + offsetY; // Add the offset to the parent y position

        let parentSpriteWidthLeftEdge = parentSpecies.initialX - (parentSpecies.width / 2)
        let parentSpriteWidthRightEdge = parentSpecies.initialX + (parentSpecies.width / 2)

        let parentSpriteHeightTopEdge = parentSpecies.initialY + (parentSpecies.height / 2)
        let parentSpriteHeightBottomEdge = parentSpecies.initialY - (parentSpecies.height / 2)

        // While the generated position is outside the WorldBounds and inside the Parent Species, generate a new position in the same way as before
        while((newSpeciesXPosition > this.width || newSpeciesXPosition < 0 || newSpeciesYPosition > this.height || newSpeciesYPosition < 0) && 
        (newSpeciesXPosition < parentSpriteWidthLeftEdge && newSpeciesXPosition > parentSpriteWidthRightEdge && newSpeciesYPosition < parentSpriteHeightTopEdge && newSpeciesYPosition > parentSpriteHeightBottomEdge)){
          angle = Math.random() * 2 * Math.PI;  

          distance = Math.random() * radius;
          offsetX = Math.cos(angle) * distance;
          offsetY = Math.sin(angle) * distance;
          newSpeciesXPosition = parentSpecies.initialX + offsetX;
          newSpeciesYPosition = parentSpecies.initialY + offsetY;
        }

        return {newSpeciesXPosition, newSpeciesYPosition} // Return the positions in the form of a object holding the x and y position
      } 

      
    
    /* 
    Method that generates a random color in the 0x000000 format
    */
    getRandomColor () {
        const red = Phaser.Math.Between(0, 255).toString(16).padStart(2, '0');
        const green = Phaser.Math.Between(0, 255).toString(16).padStart(2, '0');
        const blue = Phaser.Math.Between(0, 255).toString(16).padStart(2, '0');
      
        return `0x${red}${green}${blue}`;
    }

    /* 
    Method to convert a HEX color to the RGB format
    used primarly for the changeColorWithRBG function
    */
    hexToRGB (color) {
        const r = (color >> 16) & 0xff; // Extract the red component (bits 16-23)
        const g = (color >> 8) & 0xff; // Extract the green component (bits 8-15)
        const b = color & 0xff; // Extract the blue component (bits 0-7)
        return { r, g, b };
    }

    /* 
    Method that takes in a image and creates
    a copy of it that has all its pixels that are
    not white or black to be colored with a specific color

    Used to change the colors of the sprites in the scoreboard
    to their correct colors

    Really neat method created by chatGPT!
    */
    changeColorWithRGB (imgElement, red, green, blue) {
    // Create a new canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // Set the canvas size to match the image
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
  
    // Draw the original image on the canvas
    ctx.drawImage(imgElement, 0, 0);
  
    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
  
    // Loop through each pixel and modify the RGB values
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
  
      // Check if the pixel is neither black nor white
      if ((r !== 0 || g !== 0 || b !== 0) && (r !== 255 || g !== 255 || b !== 255)) {
        data[i] = red; // Red component
        data[i + 1] = green; // Green component
        data[i + 2] = blue; // Blue component
        // Alpha component (data[i + 3]) remains unchanged for full opacity (255)
      }
    }
  
    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
  
    return canvas;
  }
}
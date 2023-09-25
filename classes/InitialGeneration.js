import Species from "./Species.js"
import Food from "./Food.js"
import NextGeneration from "./NextGeneration.js";
import NameGenerator from "./NameGenerator.js"

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
  that the initial (first) generation is created in.

  This class instanciates the scene and creates the Species and Food sprites, and give the
  Species its attribute values.

  This class also checks when this Generation is over and then creates a new Generation called "Next Generation" where
  the surviving Species gets put into.
  */
export default class InitialGeneration extends Phaser.Scene {
    constructor(width, height, nrOfSpecies, nrOfFoods, mutation) {
        // Gives the Generation a unique ID that Phaser demands.
        let sceneID = Date.now().toString(36) + Math.random().toString(36).substr(2);
        super(sceneID);

        this.width = width
        this.height = height

        this.nrOfFoods = nrOfFoods
        this.nrOfSpecies = nrOfSpecies
        
        this.mutation = mutation

        this.survivorsSpeciesArray = []

        this.haveEndedSimulation = false
        this.generationNumber = 1
        this.speciesArray = []
        this.initialSpeciesArray = []
        this.foodArray = []

        this.arrayOfSpeciesFamilies = []

        this.speciesScoreboard = document.getElementById('speciesScoreboard') // Get the HTML element of the scoreboard
        this.scoreboardEntriesArray = []

        this.haveUpdatedScoreboardElements = false // Flag to make sure we only update the scoreboard once per generation

        /*
        Code for the HTML elements below
        */
        const generationNumberHTML = document.getElementById('generationNumber'); // Get the HTML element of the generation number
        generationNumberHTML.textContent = `1`; // Change the HTML of the generation number heading in index.html file

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
        this.game.canvas.style.width = `${this.width}px`;
        this.game.canvas.style.height = `${this.height}px`;

        this.load.image('grass', 'assets/sprites/grass.png');
        this.load.image('food', 'assets/sprites/FoodSprite.png');

        // Load every Species sprite variation that exists
        let numberOfSpeciesSprites = 15
        for(let i = 0; i < numberOfSpeciesSprites; i++){
            this.load.image(`speciesSprite-${i+1}`, `assets/sprites/Species-${i+1}.png`)
        }
    }

    // Create the initial assets for this scene
    create () {
        this.RenderTheBackground(this.width, this.height) // Render the grass background dynamically

        this.startInitialGeneration() // Creates the Species and Food sprites that will be used in this Generation Scene

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

                this.scene.remove('initialGeneration') // Removes the scene to free memory
                this.scene.add('nextGeneration', nextGeneration, true); // Add the Next Generation scene
                this.scene.start('nextGeneration'); // Start the Next Generation scene
             }
        }
    }

    /* 
    Method that instanciates the Food and Species sprites and puts them in a
    foodArray and speciesArray.
    */
    startInitialGeneration () {

        // Creates the Species Sprites and put them into a array called [speciesArray]
        for(let i = 0; i < this.nrOfSpecies; i++){

            let currentPoints = 100

            let speed = null
            let size = null
            let vision = null
            let stamina = null
            let attributeArray = [speed, size, vision, stamina]
            const nrOfTimesToRunLoop = attributeArray.length

            /* 
            The attributes of the Species sprites are based around a 100-point pot. Where each attribute is picked randomly
            and is given a value between 0 - 100. That number is then subtracted to the pot, and then the next attribute is picked randomly
            where it is given a value between 0 - (the remaining pot). This is done once for each attribute until the pot is empty.
            */
            for(let i = 0; i < nrOfTimesToRunLoop; i++){
                const randomIndex = Math.floor(Math.random() * attributeArray.length); // Decides randomly which attribute is to be picked
                const randomAttribute = attributeArray[randomIndex];

                if(randomAttribute == speed){
                    /*
                    if this is the last remaining attribute in the array
                    give it the remaining points so that the total
                    points given adds up to 100

                    Tried first by using a SWITCH CASE approach here, but that gave some unwanted behavior. Therefor a less estetically pleasing
                    else if() approach was choosen instead.
                    */
                    if(attributeArray.length == 1){
                        speed = currentPoints     
                    } else {
                        speed = Math.floor(getRandomValueInRangeWithNormalDistribution(0, currentPoints)); // Generate points between 0 and the remaining pot of points, and have the value be chosen with regards to Normal Distribution
                        currentPoints -= speed;
                        attributeArray.splice(randomIndex, 1); // Remove the attribute form the attributeArray so that it cant be picked again
                    }
                } else if(randomAttribute == size){
                    /*
                    if this is the last remaining attribute in the array
                    give it the remaining points so that the total
                    points given adds up to 100
                    */
                    if(attributeArray.length == 1){
                        size = currentPoints   
                    } else {
                        size = Math.floor(getRandomValueInRangeWithNormalDistribution(0, currentPoints)); // Generate points between 0 and the remaining pot of points, and have the value be chosen with regards to Normal Distribution
                        currentPoints -= size;
                        attributeArray.splice(randomIndex, 1); // Remove the attribute form the attributeArray so that it cant be picked again
                    }
                } else if(randomAttribute == vision){
                    /*
                    if this is the last remaining attribute in the array
                    give it the remaining points so that the total
                    points given adds up to 100
                    */
                    if(attributeArray.length == 1){
                        vision = currentPoints
                    } else {
                        vision = Math.floor(getRandomValueInRangeWithNormalDistribution(0, currentPoints)); // Generate points between 0 and the remaining pot of points, and have the value be chosen with regards to Normal Distribution
                        currentPoints -= vision;
                        attributeArray.splice(randomIndex, 1); // Remove the attribute form the attributeArray so that it cant be picked again
                    }
                } else if(randomAttribute == stamina){
                    /*
                    if this is the last remaining attribute in the array
                    give it the remaining points so that the total
                    points given adds up to 100
                    */
                    if(attributeArray.length == 1){
                        stamina = currentPoints
                    } else {
                        stamina = Math.floor(getRandomValueInRangeWithNormalDistribution(0, currentPoints)); // Generate points between 0 and the remaining pot of points, and have the value be chosen with regards to Normal Distribution
                        currentPoints -= stamina;
                        attributeArray.splice(randomIndex, 1); // Remove the attribute form the attributeArray so that it cant be picked again
                    }
                }
            }

            const nameGenerator = new NameGenerator()
            const name = nameGenerator.generateRandomTeamName() // Generate a random name for the Species
            const color = `0x${Math.floor(Math.random()*16777215).toString(16)}`; // Give the Species a random color
            //const color = this.getRandomColor(); // Generates a random color in the 0xFFFFFF format, but is not used for the moment

            let randomSpeciesSpriteNr = Math.floor(Math.random() * (15 - 1 + 1) + 1)

            const species = new Species(this, 0, 0, undefined, randomSpeciesSpriteNr, name, color, speed, size, vision, stamina) // Setting 0, 0 as placeholder positions that will be changed after with [species.generateValidPosition]
            species.generateValidPosition(this.speciesArray) // Generate unique starting positions alongside the edges of the scene for the Species

            this.speciesArray.push(species)
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
    Method that appends (inserts) the scoreboardEntriesArray info and img elements
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

    /* 
    Method that generates a random color in the 0x000000 format (is mainly used for testing purposes)
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

    Really neat method created by CHATgpt!
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
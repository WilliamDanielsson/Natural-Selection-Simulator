import InitialGeneration from "./classes/InitialGeneration.js";
import StartScreenScene from "./classes/startScreenScene.js";

/* 
Javascript File that is at the top of the hiearchy and that instanciates the whole game.

Also holds the Javascript for the HTML elements for the index.html file 

Two Phaser.Game events are created. One for the startScreen to display the moving background
and one for the InitialGeneration that then will take over and execute the rest of the game.
*/

// Declare the public variabels at the top
let nrOfSpecies = undefined
let nrOfFoods = undefined
let mutation = undefined
let worldWidth = undefined
let worldHeight = undefined
let game = undefined

// Get all the necessary HTML elements and initiate all EventListeners
let startScreenDiv = document.getElementById('startScreenDiv')

let speciesScoreboardImage = document.getElementById('scoreboardImage')
let speciesScoreboard = document.getElementById('speciesScoreboard')

let generationNumber = document.getElementById('generationNumber')
let generationNumberImage = document.getElementById('generationNumberImage')

const startGameButton = document.getElementById('startGameButton');
startGameButton.addEventListener('click', handleStartGameButtonClick); // Event Listener for the start game button, when clicked, the simulation starts

const configurationForm = document.getElementById('simulationForm');
configurationForm.addEventListener('submit', handleConfigurationFormSubmit); // Event Listener for the configuration form of the simulation, when submitted the data is stored in the variables

let restartButton = document.getElementById('restartButton')
restartButton.addEventListener('click', handleRestartButtonClick); // Event Listener for the start game button, when clicked, the simulation restarts
let restartButtonImage = document.getElementById('restartButtonImage')

let exitButton = document.getElementById('exitButton')
exitButton.addEventListener('click', handleExitButtonClick); // Event Listener for the exit button, when clicked, the user gets back to the start screen
let exitButtonImage = document.getElementById('exitButtonImage')

let pauseButton = document.getElementById('pauseButton')
let pauseButtonImage = document.getElementById('pauseButtonImage')


/* 
Code that runs the Phaser instance. Here the Phaser instances
is being configurated and set-up. And the StartScreen 
is created and put to use.
*/
const width = window.innerWidth // Width of the screen
const height = window.innerHeight // Height of the screen

const startScreenScene = new StartScreenScene(width, height)

// Config object for the Phaser.Game
let config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {     
        }
    },
    scene: [startScreenScene]
};

game = new Phaser.Game(config); // A phaser Game with the StartScreenScene is created and put in use
 
const gameCanvas = game.canvas; // Get the canvas element created by Phaser 
    
// Styling the game canvas so that it covers the whole screen in the correct way
gameCanvas.style.position = "absolute"
gameCanvas.style.top = "0"
gameCanvas.style.left = "0"
gameCanvas.style.zIndex = "0"

/*
 *
 *
 * 
    ******* FUNCTIONS BELOW *******
*
*
*
*/

/* 
When the user have submitted the configuration form, execute the following code that 
saves the inputs in variables 
*/
function handleConfigurationFormSubmit (event) {
    event.preventDefault(); // Prevent the form from submitting and refreshing the page (think this code here might be unecesarry)

    // Retrieve the form data
    const formNrOfSpeciesInput = parseInt(document.getElementById('nrOfSpecies').value)
    const formNrOfFoodsInput = parseInt(document.getElementById('nrOfFoods').value)

    const formMutationInput = parseFloat(document.getElementById('mutationInput').value)

    const formWorldWidth = parseInt(document.getElementById('worldWidth').value)
    const formWorldHeight = parseInt(document.getElementById('worldHeight').value)

    // Change the variabels to the form data
    nrOfSpecies = formNrOfSpeciesInput 
    nrOfFoods = formNrOfFoodsInput
    mutation = formMutationInput
    worldWidth = formWorldWidth
    worldHeight = formWorldHeight

    //form.reset(); // Clear the form inputs (optional
};


/* 
When the user presses the Exit button the current Generation scene is destroyed and 
the user is taken back to the Start Screen

All HTML elements of the game instance is also re-hidden again so that they do not
appear at the start screen
*/
function handleExitButtonClick () {
    game.destroy() // Removes the game instance from Phaser

    let canvas = document.querySelector('canvas');
    // Check if the canvas element exists
    if (canvas) {
        // If the canvas element exists, remove it from its parent node in the HTML document
        canvas.parentNode.removeChild(canvas);
        /* 
        This ensures that the canvas element is properly cleaned up
        and removed from the document before creating a new game instance
        This is needed because Phaser only handled its own components, but elements can still be 
        active in the HTML canvas and therefor the render of the game canvas might still be active 
        even after calling game.destroy, therefor this code removes the canvas element manually as well
        */
    }

    startScreenDiv.style.display = 'flex' // Change the CSS to display all the things from the StartScreen again

    // Hide the elements from the game instance again
    speciesScoreboardImage.style.display = 'none'
    speciesScoreboard.style.display = 'none'

    generationNumber.style.display = 'none'
    generationNumberImage.style.display = 'none'

    restartButton.style.display = 'none'
    restartButtonImage.style.display = 'none'

    exitButton.style.display = 'none'
    exitButtonImage.style.display = 'none'

    pauseButton.style.display = 'none'
    pauseButtonImage.style.display = 'none'

    config.width = width // Current Width of the screen
    config.height = height // Current Height of the screen

    const startScreenScene = new StartScreenScene(width, height) // Create a new StartScreenScene
    config.scene = [startScreenScene] // Change the scene to the Start Screen once again

    game = new Phaser.Game(config); // A phaser Game with the StartScreenScene is created and put in use

    const gameCanvas = game.canvas; // Get the canvas element created by Phaser 
    
    // Styling the game canvas so that it covers the whole screen in the correct way
    gameCanvas.style.position = "absolute"
    gameCanvas.style.top = "0"
    gameCanvas.style.left = "0"
    gameCanvas.style.zIndex = "0"
}

/* 
When the user presses the Restart button the current Generation scene is destroyed and 
a InitialGeneration scene is created again in its place. This InitialGeneration has
the same values as the first one. So that it restarts with the same parameters again.

No HTML elements need to be hidden here since we are not changing screens
*/
function handleRestartButtonClick () {
    game.destroy() // Removes the game instance from Phaser

    const canvas = document.querySelector('canvas');
    // Check if the canvas element exists
    if (canvas) {
        // If the canvas element exists, remove it from its parent node in the HTML document
        canvas.parentNode.removeChild(canvas);
        /* 
        This ensures that the canvas element is properly cleaned up
        and removed from the document before creating a new game instance
        This is needed because Phaser only handled its own components, but elements can still be 
        active in the HTML canvas and therefor the render of the game canvas might still be active 
        even after calling game.destroy, therefor this code removes the canvas element manually as well
        */
    }

    // Change the config to once again match the InitialGeneration setup
    config.width = worldWidth
    config.height = worldHeight
    const initialGeneration = new InitialGeneration(worldWidth, worldHeight, nrOfSpecies, nrOfFoods, mutation/100)
    config.scene = [initialGeneration] // Change the scene to the newly created InitialGeneration scene

    game = new Phaser.Game(config) // Start the simulation

    // Styling the game canvas for the simulation with a nice looking border
    const gameCanvas = game.canvas;
    gameCanvas.style.border = '9px solid';
    gameCanvas.style.marginTop = '15px';
    gameCanvas.style.borderColor = '#ECB751';
    gameCanvas.style.borderRadius = '10px';
}
  

/* 
When the user clicks the Start Game Button, hide the HTML elements of the Start Screen elements,
destroy the startScreenScene and create a new Phaser.Game instance that now will be the InitialGeneration instead
that will start the simulation and use the inputs from the Start Screen Form.
*/
function handleStartGameButtonClick () {

    startScreenDiv.style.display = 'none' // Change the CSS to "display: none" so that all the HTML elements from the Start Screen is hidden

    // Display all the relevant HTML elements of the game instance
    speciesScoreboardImage.style.display = 'block'
    speciesScoreboard.style.display = 'block'

    let scoreboardImageMargin = worldWidth + 50
    speciesScoreboardImage.style.left = `${scoreboardImageMargin}px` // Change the CSS left property dynamically
    speciesScoreboardImage.style.top = `100px`

    generationNumber.style.display = 'block'
    generationNumberImage.style.display = 'block'

    restartButton.style.display = 'block'
    restartButtonImage.style.display = 'block'

    exitButton.style.display = 'block'
    exitButtonImage.style.display = 'block'
    
    // Change the CSS of the Scoreboard dynamically
    const getCSSStyleForScoreboardImage = window.getComputedStyle(speciesScoreboardImage);
    const scoreboardLeft = getCSSStyleForScoreboardImage.getPropertyValue('left'); // Get the Left CSS value
    const scoreboardLeftValue = parseFloat(scoreboardLeft);

    const scoreboardTop = getCSSStyleForScoreboardImage.getPropertyValue('top'); // Get the Top CSS value
    const scoreboardTopValue = parseFloat(scoreboardTop); // Change the float into an integer

    const scoreboardHeight = getCSSStyleForScoreboardImage.getPropertyValue('height'); // Get the Height CSS value
    const scoreboardHeightValue = parseFloat(scoreboardHeight); // Change the float into an integer

    // Change the CSS of the Restart and Exit Buttons dynamically
    restartButton.style.left = `${scoreboardLeftValue + 150}px`
    restartButton.style.top = `${scoreboardTopValue + scoreboardHeightValue + 20}px`

    let distanceBetweenRestartAndExitButton = 275 // Add a horizontal distance between the Restart and Exit buttons 

    exitButton.style.left = `${scoreboardLeftValue + 150 + distanceBetweenRestartAndExitButton}px`
    exitButton.style.top = `${scoreboardTopValue + scoreboardHeightValue + 13}px`
    
    // Remove the current scene and add a new one
    game.destroy() // Removes the game instance from Phaser

    const canvas = document.querySelector('canvas');
    // Check if the canvas element exists
    if (canvas) {
        // If the canvas element exists, remove it from its parent node in the HTML document
        canvas.parentNode.removeChild(canvas);
        /* 
        This ensures that the canvas element is properly cleaned up
        and removed from the document before creating a new game instance
        This is needed because Phaser only handled its own components, but elements can still be 
        active in the HTML canvas and therefor the render of the game canvas might still be active 
        even after calling game.destroy, therefor this code removes the canvas element manually as well
        */
    }

    // Change the config of the Game to match the inputs from the Configuration Form
    config.width = worldWidth
    config.height = worldHeight
    const initialGeneration = new InitialGeneration(worldWidth, worldHeight, nrOfSpecies, nrOfFoods, mutation/100)
    config.scene = [initialGeneration] // Change the scene to the newly created InitialGeneration scene

    game = new Phaser.Game(config) // Start the simulation
    
    // Styling the game canvas for the simulation with a nice looking border
    const gameCanvas = game.canvas;
    gameCanvas.style.border = '9px solid';
    gameCanvas.style.marginTop = '15px';
    gameCanvas.style.borderColor = '#ECB751';
    gameCanvas.style.borderRadius = '10px';
}
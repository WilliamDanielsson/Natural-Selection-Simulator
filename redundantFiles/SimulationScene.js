import InitialGeneration from "./InitialGeneration.js";
import NextGeneration from "./NextGeneration.js";
import StartScreenScene from "./StartScreenScene.js";


// !!!This class is redundant for the moment and serves no purpose!!! it is replaced by startScreen.js

/* 
Class that holds all the Scenes from Phaser. Here it is decided what scenes should run

This class is at the moment kinda redudant, since the generation switching is done in the InitialGeneration
and NextGeneration directly. But this class might come in handy later on.
*/
export default class SimulationScene extends Phaser.Scene {
    constructor(width, height) {
        super('simulationScene'); // Set the key for the SimulationScene
        this.width = width
        this.height = height

        this.initialGeneration = undefined
        this.currentGeneration = undefined
        this.startScreenScene = undefined

        this.haveSwitchedScene = false
    }

    // Assets to load in before the render
    preload() {
        // Preload any assets specific to the SimulationScene
    }

    // Create the initial assets for this scene
    create() {
        //this.currentGeneration = new InitialGeneration(this.width, this.height)
        //this.scene.add('initialGeneration', this.currentGeneration, true); // Add the Generation scene
        //this.scene.start('initialGeneration'); // Start the Generation scene

        this.startScreenScene = new StartScreenScene()
        this.scene.add('startScreenScene', this.startScreenScene, true); // Add the Generation scene
        this.scene.start('startScreenScene'); // Start the Generation scene

    }

    // The core gameplay loop for this scene, running 60 times per second.
    update() {
        console.log("hi")
      if(this.startScreenScene.hasPressedStartGameButton == true && this.haveSwitchedScene == false){

        this.haveSwitchedScene = true
        this.initialGeneration = new InitialGeneration(this.width, this.height)
        this.scene.remove('startScreenScene') // Removes the scene to free memory
        this.scene.add('initialGeneration', initialGeneration, true); // Add the Generation scene
        this.scene.start('initialGeneration'); // Start the Generation scene

      }
    }
}

import SimulationScene from "./classes/SimulationScene.js"


// !!!This class is redundant for the moment and serves no purpose!!! it is replaced by startScreen.js


/* 
Main Class that runs the Phaser instance. Here the Phaser instance
is being configurated and set-up. And a initial scene is choosen.
*/

const width = 800
const height = 600
const simulationScene = new SimulationScene(width, height)
//const introScreenScene = new IntroScreenScene()

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {     
        }
    },
    scene: [simulationScene]
};

const game = new Phaser.Game(config);
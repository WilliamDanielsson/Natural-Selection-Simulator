# Natural Selection-Simulator

This is a plain web application using [Phaser JS](https://phaser.io/). 

The application is a simulation of the semi-Machine Learning algorithm NEAT (NeuroEvolution of Augmenting Tapologies) where a simulation simulates real natural selection by having etenties live, die and give birth where the strong ones live on to spread their genes and the weak ones go extinct.

The simulation is played out by setting a field size, number of foods, number of species and a mutation percentage which determines how extreme the mutation of genes can be.

Each species hold a value of 4 destinct attributes. 
    * Vision (the distance where they can see)
    * Stamina (how long they can go without food before they die)
    * Speed (the speed of the species)
    * Size (the size of the species)

Then the simulation starts with all species spawning at the edges of the arena. The goal of each species is to eat one of the foods that roam around. And if they do they go to the next round. 
The species that has their stamina depleted or are left when al the food is eaten dies. While the other survives to the next generation.

In the next round every species will have a chance to give birth to 1-3 children. Where each children will get attributes based of their parents. But that will have some attributes mutated where the 
value can either increase or shrink by random.

That round then plays out excactly the same. This creates a loop where the species adapt more and more for each generation and the ones with the good attributes survive and adapt to become better at gathering the food.
While the ones that have worse stats go extinct. After a while one or two species will generally outperform all the other species by the nature of natural selection.

## The code structure

The code is written to be as dynamic as possible. Where it should be possible to add more attributes in the future such as: 
    * Species being able to eat each other if they are bigger
    * Chance to get diseases
    * Chance to be immmune to certain diseases
    * Chance for new species to spawn randomly to change up the ecosystem
    * Having different
    * Different biomes where some species will perform better in than others.
    * Catastrofic events such as earthquakes or tsunamis that can wipe out entire populations
    ... and much more. The possibilites are endless

### The code quality
The application is made as a hobby project and thus isnt using best practices. And there is probably bugs or wierd work arounds for certain functions.
The application is heavily commented where each major function is explained in detail. 

## How to Start
cd into Natural-Selection-Simulator

```bash
    cd Natural-Selection-Simulator
```

Run npm install to install phaser dependencies
```bash
    npm install
```

Start the simulation by using visual studio code and installing the extension live-server. 

Go into the index.html file and click on "Go Live" in the bottom right corner

The application will open in your default browser window.

## System requirements

- Node
- NPM
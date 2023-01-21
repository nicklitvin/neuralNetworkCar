# Description

Visualization of a neural network in a car learning how to pass traffic using sensors.

View my implementation: https://nicklitvin.github.io/neuralNetworkCar/

Credit to original idea: https://www.youtube.com/watch?v=Rs_rAxEsAvI&t

# How does the site work?

The site consists of the following five buttons. 

- start - creates road if none exist and starts simulation

- destroy - destory all data (brain,road,score...)

- new road - creates new road

- refresh page - refreshes page (does not delete any data)

- fast develop - runs simulation many times without visuals

To view information regarding the simulation, open the Web Console. 

Note that there is a 1sec delay after a simulation ends to process the results of the simulation. Don't start new simulations until the results are printed in the console. Otherwise, they will not be saved.

# Setup

Install Typescript (through package.json)

```
npm install
```

Install Live Server on VSCode to run program locally

# Notes

Values under the adjustable tag at the beginning of some classes
can be modified within reason without breaking the program. 

If fast develop is continuously failing, try a new road or adjusting the values.


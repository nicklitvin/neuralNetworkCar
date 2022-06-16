let simulation : Simulation;

function createSimulation() : void {
    const element = document.getElementById("myCanvas"); 
    const canvas = element as HTMLCanvasElement;
    canvas.width = 200;
    canvas.height = window.innerHeight;

    simulation = new Simulation(canvas);
    simulation.start();
}

function destroyAll() : void {
    Simulation.destroyAll();
}

function newRoad() : void {
    simulation.newRoad();
}

function startAgain() : void {
    simulation.startAgain();
}

createSimulation();

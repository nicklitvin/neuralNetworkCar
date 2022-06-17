let simulation : Simulation;

function createSimulation() : void {
    console.clear();
    const element = document.getElementById("myCanvas"); 
    const canvas = element as HTMLCanvasElement;

    simulation = new Simulation(false,canvas);
    simulation.start();
}

function destroyAll() : void {
    console.clear();
    Simulation.destroyAll();
}

function newRoad() : void {
    if (simulation == null) {
        console.log("cant create road, no simulation");
    } else {
        console.clear();
        simulation.newRoad();
    }
}

function startAgain() : void {
    Simulation.startAgain();
}

function speedRun() : void {
    console.clear();
    const element = document.getElementById("myCanvas"); 
    const canvas = element as HTMLCanvasElement;
    Simulation.speedBrainDevelopment(canvas);
}

function setupCanvas() : void {
    const element = document.getElementById("myCanvas"); 
    const canvas = element as HTMLCanvasElement;
    canvas.width = 200;
    canvas.height = window.innerHeight;
}

setupCanvas();

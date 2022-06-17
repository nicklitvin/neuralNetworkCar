let simulation;
function createSimulation() {
    console.clear();
    const element = document.getElementById("myCanvas");
    const canvas = element;
    simulation = new Simulation(false, canvas);
    simulation.start();
}
function destroyAll() {
    console.clear();
    Simulation.destroyAll();
}
function newRoad() {
    if (simulation == null) {
        console.log("cant create road, no simulation");
    }
    else {
        console.clear();
        simulation.newRoad();
    }
}
function startAgain() {
    Simulation.startAgain();
}
function speedRun() {
    console.clear();
    const element = document.getElementById("myCanvas");
    const canvas = element;
    Simulation.speedBrainDevelopment(canvas);
}
function setupCanvas() {
    const element = document.getElementById("myCanvas");
    const canvas = element;
    canvas.width = 200;
    canvas.height = window.innerHeight;
}
setupCanvas();

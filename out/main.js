let simulation;
function createSimulation() {
    const element = document.getElementById("myCanvas");
    const canvas = element;
    canvas.width = 200;
    canvas.height = window.innerHeight;
    simulation = new Simulation(canvas);
    simulation.start();
}
function destroyAll() {
    Simulation.destroyAll();
}
function newRoad() {
    simulation.newRoad();
}
function startAgain() {
    simulation.startAgain();
}
createSimulation();

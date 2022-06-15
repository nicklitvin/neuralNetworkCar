const canvas = document.getElementById("myCanvas");
canvas.width = 200;
canvas.height = window.innerHeight;
const LANE_COUNT = 3;
const START_LANE = 2;
const SMART_CARS_NUM = 100;
const MUTATE_STRICT = 0.1;
const TIME_LIMIT_SEC = 5;
const DRAW_SENSORS = false;
const STORAGE_BRAIN = "bestBrain";
const STORAGE_HIGH = "bestY";
const STORAGE_MUTATE = "mutateConstant";
let STORED_CONSTANT = localStorage.getItem(STORAGE_MUTATE);
let MUTATE_CONSTANT = STORED_CONSTANT ? Number(STORED_CONSTANT) : 0.7;
console.log("mutate constant:", MUTATE_CONSTANT);
let timeLimit = false;
setTimeout(() => {
    timeLimit = true;
}, TIME_LIMIT_SEC * 1000);
const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.height / 2, canvas.width - 20, canvas.height * 100, LANE_COUNT);
const smartCars = generateCars(SMART_CARS_NUM);
const dummyCars = [
    new Car(road.getLaneXval(2), 800),
    new Car(road.getLaneXval(3), 600),
    new Car(road.getLaneXval(2), 600),
    new Car(road.getLaneXval(1), 400),
    new Car(road.getLaneXval(3), 400)
];
function saveBestBrain() {
    let highScore = localStorage.getItem(STORAGE_HIGH);
    smartCars.forEach(car => car.calculatePerformance());
    smartCars.sort((a, b) => b.score - a.score);
    console.log("previous score:", Number(highScore));
    console.log("curr score:", smartCars[0].score);
    if (!highScore || smartCars[0].score > Number(highScore)) {
        let newConstant = MUTATE_CONSTANT / 2;
        localStorage.setItem(STORAGE_BRAIN, JSON.stringify(smartCars[0].brain));
        localStorage.setItem(STORAGE_HIGH, String(smartCars[0].score));
        localStorage.setItem(STORAGE_MUTATE, String(newConstant));
    }
    else {
        console.log("increasing mutate constant");
        let newConstant = MUTATE_CONSTANT * (1 + MUTATE_STRICT);
        localStorage.setItem(STORAGE_MUTATE, String(newConstant));
    }
}
function generateCars(num) {
    let cars = [];
    for (let i = 0; i < num; i++) {
        let brain = JSON.parse(localStorage.getItem(STORAGE_BRAIN));
        if (i > 0 && brain) {
            NeuralNetwork.mutate(brain, MUTATE_CONSTANT);
        }
        let car = new Car(road.getLaneXval(2), 1000, false, brain);
        cars.push(car);
    }
    return cars;
}
function animate() {
    smartCars.sort((a, b) => a.location.y - b.location.y);
    canvas.height = window.innerHeight;
    ctx.save();
    ctx.translate(0, -smartCars[0].location.y + canvas.height * 0.7);
    let borders = road.borders;
    for (let car of dummyCars) {
        car.update();
        car.draw(ctx, false);
        borders = borders.concat(car.borders);
    }
    for (let i = 0; i < smartCars.length; i++) {
        let car = smartCars[i];
        car.update(borders);
        if (!car.damaged) {
            car.updateCarsPassed(dummyCars);
        }
        if (i == 0) {
            car.draw(ctx, DRAW_SENSORS);
        }
        else {
            car.update(borders);
            car.draw(ctx, false);
        }
    }
    road.draw(ctx);
    ctx.restore();
    if (areAllDead() || timeLimit) {
        saveBestBrain();
    }
    else {
        requestAnimationFrame(animate);
    }
}
function areAllDead() {
    for (let car of smartCars) {
        if (!car.damaged) {
            return false;
        }
    }
    return true;
}
function discardBrain() {
    console.log("Discard");
    localStorage.removeItem(STORAGE_BRAIN);
    localStorage.removeItem(STORAGE_HIGH);
    startAgain();
}
function startAgain() {
    location.reload();
}
animate();

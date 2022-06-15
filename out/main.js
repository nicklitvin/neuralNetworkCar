const canvas = document.getElementById("myCanvas");
canvas.width = 200;
canvas.height = window.innerHeight;
const LANE_COUNT = 3;
const START_LANE = 2;
const SMART_CARS_NUM = 100;
const MUTATE_CONSTANT = 1;
const STORAGE_BRAIN = "bestBrain";
const STORAGE_Y = "bestY";
const TIME_LIMIT_SEC = 5;
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
    let highScore = localStorage.getItem(STORAGE_Y);
    let smartSorted = smartCars.sort((a, b) => (b.carsPassed - a.carsPassed));
    if (!highScore || smartSorted[0].carsPassed < Number(highScore)) {
        localStorage.setItem(STORAGE_BRAIN, JSON.stringify(smartSorted[0].brain));
        localStorage.setItem(STORAGE_Y, String(smartSorted[0].carsPassed));
    }
}
function generateCars(num) {
    let cars = [];
    for (let i = 0; i < num; i++) {
        let brain = JSON.parse(localStorage.getItem(STORAGE_BRAIN));
        let car = new Car(road.getLaneXval(2), 1000, false, brain);
        cars.push(car);
        if (brain) {
            NeuralNetwork.mutate(brain, MUTATE_CONSTANT);
        }
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
            ctx.globalAlpha = 1;
            car.draw(ctx, true);
        }
        else {
            ctx.globalAlpha = 0.2;
            car.update(borders);
            car.draw(ctx, false);
        }
    }
    ctx.globalAlpha = 1;
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
    localStorage.removeItem(STORAGE_Y);
}
animate();

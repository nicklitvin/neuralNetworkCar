const canvas : HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
canvas.width = 200;
canvas.height = window.innerHeight;

const LANE_COUNT = 3;
const START_LANE = 2;
const SMART_CARS_NUM = 10;
const MUTATE_CONSTANT = 0.1;
const STORAGE_BRAIN = "bestBrain";
const STORAGE_Y = "bestY";

let timeLimit = false;
setTimeout( () => {
    timeLimit = true;
},10000);

const ctx : CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const road : Road = new Road(canvas.width/2,canvas.height/2,canvas.width - 20, canvas.height * 100,LANE_COUNT);

const smartCars : Car[] = generateCars(SMART_CARS_NUM);
const dummyCars : Car[] = [
    new Car(road.getLaneXval(2),800),
    new Car(road.getLaneXval(3),600),
    new Car(road.getLaneXval(2),600),
    new Car(road.getLaneXval(1),400),
    new Car(road.getLaneXval(3),400)
];

function saveBestBrain() {
    let highScore = localStorage.getItem(STORAGE_Y);
    smartCars.sort( (a,b) => (a.location.y - b.location.y));

    if (!highScore || smartCars[0].location.y < Number(highScore)) {
        localStorage.setItem(STORAGE_BRAIN,JSON.stringify(smartCars[0].brain));
        localStorage.setItem(STORAGE_Y, String(smartCars[0].location.y));
    }
}

function generateCars(num : number) : Car[] {
    // let brain : NeuralNetwork = JSON.parse(localStorage.getItem(STORAGE_BRAIN));
    let brain = null;
    let cars : Car[] = [];
    
    for (let i = 0; i < num; i++) {
        cars.push(new Car(road.getLaneXval(2),1000,false,brain));
        NeuralNetwork.mutate(brain,MUTATE_CONSTANT);
    }
    return cars;
}

function animate() : void {
    smartCars.sort( (a,b) => a.location.y - b.location.y);

    canvas.height = window.innerHeight;
    ctx.save();
    ctx.translate(0,-smartCars[0].location.y + canvas.height * 0.7);
    
    let borders : Border[] = road.borders;

    for (let car of dummyCars) {
        car.update();
        car.draw(ctx,false);
        borders = borders.concat(car.borders);
    }

    for (let i = 0; i < smartCars.length; i++) {
        let car : Car = smartCars[i];
        car.update(borders);

        if (i == 0) {
            ctx.globalAlpha = 1;
            car.draw(ctx,true);
        } else {
            ctx.globalAlpha = 0.2;
            car.update(borders);
            car.draw(ctx,false);
        }
    }
    ctx.globalAlpha = 1;

    road.draw(ctx);
    ctx.restore();

    if (areAllDead() || timeLimit) {
        saveBestBrain();
    } else {
        requestAnimationFrame(animate)
    }
}

function areAllDead() : boolean {
    for (let car of smartCars) {
        if (!car.damaged) {
            return false;
        }
    }
    return true;
}

animate()


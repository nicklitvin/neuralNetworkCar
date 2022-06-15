const canvas : HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
canvas.width = 200;
canvas.height = window.innerHeight;

const LANE_COUNT = 3;
const START_LANE = 2;
const START_Y = 0;
const SMART_CARS_NUM = 250;
const DUMMY_CARS_NUM = 50;
const MUTATE_GROWTH = 0.02;
const TIME_LIMIT_SEC = 5;
const DRAW_SENSORS = true;

const STORAGE_DUMMIES = "dummyCars";
const STORAGE_BRAIN = "bestBrain";
const STORAGE_HIGH = "bestY";
const STORAGE_MUTATE = "mutateConstant";
const STORAGE_FAIL = "failCount"; 

let STORED_CONSTANT = localStorage.getItem(STORAGE_MUTATE);
let MUTATE_CONSTANT : number = STORED_CONSTANT ? Number(STORED_CONSTANT) : 1.5;
console.log("mutate constant:",MUTATE_CONSTANT);

let timeLimit = false;

setTimeout( () => {
    timeLimit = true;
},TIME_LIMIT_SEC * 1000);

const ctx : CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const road : Road = new Road(canvas.width/2,canvas.height/2,canvas.width - 20, canvas.height * 100,LANE_COUNT);

if (localStorage.getItem(STORAGE_DUMMIES) == null) {
    newRoad();
}

const smartCars : Car[] = generateSmartCars(SMART_CARS_NUM);
const dummyCars : Car[] = loadDummies();

function saveBestBrain() {
    let highScore = localStorage.getItem(STORAGE_HIGH);
    
    smartCars.forEach(car => car.calculatePerformance());
    smartCars.sort( (a,b) => b.score - a.score);
    
    console.log("previous score:",Number(highScore));
    console.log("curr score:", smartCars[0].score);

    if (!highScore || smartCars[0].score > Number(highScore)) {
        localStorage.setItem(STORAGE_BRAIN,JSON.stringify(smartCars[0].brain));
        localStorage.setItem(STORAGE_MUTATE, String(MUTATE_CONSTANT / 2));
        localStorage.setItem(STORAGE_FAIL,String(0));
    } else {
        let failCount : number = Number(localStorage.getItem(STORAGE_FAIL));

        console.log("increasing mutate constant");
        let newConstant : number = MUTATE_CONSTANT * ( (1 + MUTATE_GROWTH) ** failCount);
        localStorage.setItem(STORAGE_MUTATE, String(newConstant));
        localStorage.setItem(STORAGE_FAIL, String(failCount + 1));
    }

    localStorage.setItem(STORAGE_HIGH, String(smartCars[0].score));
}

function generateSmartCars(num : number) : Car[] {
    let cars : Car[] = [];
    
    for (let i = 0; i < num; i++) {
        let brain : NeuralNetwork = JSON.parse(localStorage.getItem(STORAGE_BRAIN));
        if (i > 0 && brain) {
            NeuralNetwork.mutate(brain,MUTATE_CONSTANT);
        }
        let car : Car = new Car(road.getLaneXval(2),START_Y,false,brain);
        cars.push(car);
    }
    return cars;
}

function generateDummyCars(num : number) : Car[] {
    let cars : Car[] = [];
    let currY = START_Y - 200;
    let lanesTaken : number[] = [];

    for (let i = 0; i < num; i++) {
        if (lanesTaken.length > Math.floor(LANE_COUNT / 4)) {
            currY -= 200;
            lanesTaken = [];
        }

        let lane = Math.floor((Math.random()*LANE_COUNT));
        while (lanesTaken.includes(lane)) {
            lane = (lane + 1) % LANE_COUNT;
        }
        lanesTaken.push(lane);

        cars.push(new Car(road.getLaneXval(lane + 1),currY));
    }
    return cars;
}

function animate() : void {
    smartCars.sort( (a,b) => a.location.y - b.location.y);

    canvas.height = window.innerHeight;
    ctx.save();
    ctx.translate(0,-smartCars[0].location.y + canvas.height * 0.8);
    
    let borders : Border[] = road.borders;

    for (let car of dummyCars) {
        car.update();
        car.draw(ctx,false);
        borders = borders.concat(car.borders);
    }

    for (let i = 0; i < smartCars.length; i++) {
        let car : Car = smartCars[i];
        car.update(borders);

        if (!car.damaged) {
            car.updateCarsPassed(dummyCars);
        }

        if (i == 0) {
            car.draw(ctx,DRAW_SENSORS);
        } else {
            car.update(borders);
            car.draw(ctx,false);
        }
    }

    road.draw(ctx);
    ctx.restore();

    if (areAllDead() || timeLimit) {
        saveBestBrain();
        startAgain();
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

function discardBrain() : void {
    console.log("Discard")
    localStorage.removeItem(STORAGE_BRAIN);
    localStorage.removeItem(STORAGE_HIGH);
    localStorage.removeItem(STORAGE_MUTATE);
    localStorage.removeItem(STORAGE_FAIL);
    startAgain();
}

function startAgain() {
    location.reload();
}

function newRoad() {
    let dummies = generateDummyCars(DUMMY_CARS_NUM);
    localStorage.setItem(STORAGE_DUMMIES,JSON.stringify(dummies));
    startAgain();
}

function loadDummies() : Car[] {
    let cars : Car[] = [];
    const dummies : Car[] = JSON.parse(localStorage.getItem(STORAGE_DUMMIES));
    for (let dummy of dummies) {
        cars.push(new Car(dummy.location.x,dummy.location.y,true));    
    }
    return cars;
}

animate();


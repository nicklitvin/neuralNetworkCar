const canvas : HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
canvas.width = 200;
canvas.height = window.innerHeight;

const LANE_COUNT = 3;
const START_LANE = 2;

const ctx : CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const road : Road = new Road(canvas.width/2,canvas.height/2,canvas.width - 20, canvas.height * 100,LANE_COUNT);
const myCar : Car = new Car(road.getLaneXval(START_LANE),1000,false);

const cars : Car[] = [
    new Car(road.getLaneXval(2),800),
    new Car(road.getLaneXval(3),600),
    new Car(road.getLaneXval(2),600),
    new Car(road.getLaneXval(1),400),
    new Car(road.getLaneXval(3),400)
];

function animate() : void {
    canvas.height = window.innerHeight;
    ctx.save();
    ctx.translate(0,- myCar.location.y + canvas.height * 0.7);
    
    let borders : Border[] = road.borders;

    for (let car of cars) {
        car.update();
        car.draw(ctx);
        borders = borders.concat(car.borders);
    }
    myCar.update(borders);
    myCar.draw(ctx);
    
    road.draw(ctx);
    ctx.restore();

    requestAnimationFrame(animate)
}

animate()


const canvas : HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
canvas.width = 200;
canvas.height = window.innerHeight;

const ctx : CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const car = new Car(100,100,30,50);
const road = new Road(canvas.width/2,canvas.height/2,canvas.width - 20, canvas.height * 100,3);

function animate() : void {
    canvas.height = window.innerHeight;
    car.update();

    ctx.translate(0,-car.y + canvas.height*0.7);
    car.draw(ctx);
    road.draw(ctx);

    requestAnimationFrame(animate)
}

animate()
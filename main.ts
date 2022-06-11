const canvas : HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx : CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const car = new Car(100,100,30,50);

canvas.width = 200;
canvas.height = window.innerHeight;

function animate() : void {
    canvas.height = window.innerHeight;
    car.update(canvas);
    car.draw(ctx);
    requestAnimationFrame(animate)
}

animate()

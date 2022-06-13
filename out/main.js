const canvas = document.getElementById("myCanvas");
canvas.width = 200;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const car = new Car(30, 100, 30, 50);
const road = new Road(canvas.width / 2, canvas.height / 2, canvas.width - 20, canvas.height * 100, 3);
function animate() {
    canvas.height = window.innerHeight;
    car.update(road.borders);
    ctx.translate(0, -car.location.y + canvas.height * 0.7);
    car.draw(ctx);
    road.draw(ctx);
    requestAnimationFrame(animate);
}
animate();

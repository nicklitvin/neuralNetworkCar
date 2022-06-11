const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const car = new Car(100, 100, 30, 50);
canvas.width = 200;
canvas.height = window.innerHeight;
function animate() {
    canvas.height = window.innerHeight;
    car.update(canvas);
    car.draw(ctx);
    requestAnimationFrame(animate);
}
animate();

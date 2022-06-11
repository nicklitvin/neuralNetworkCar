var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var car = new Car(100, 100, 30, 50, ctx);
canvas.width = 200;
canvas.height = window.innerHeight;
function animate() {
    canvas.height = window.innerHeight;
    car.update();
    car.draw();
    requestAnimationFrame(animate);
}
animate();

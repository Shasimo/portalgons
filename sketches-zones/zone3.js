// demonstration zone

function setup_zone3(sketch) {
    sketch.createCanvas(wW, wH).parent('zone-two');
    sketch.fill("black");
    sketch.textSize(40);
    sketch.strokeWeight(2);
}

function draw_zone3(sketch) {
    sketch.background(200);
    sketch.text("Zone3", 30, 50);

    if (portalgon !== null) {
        portalgon.drawTriangulation(sketch);
    }

}
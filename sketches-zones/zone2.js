// demonstration zone
let triangulatedPortalgon = null;
let source = null;
let destination = null;
let previewPointZone2 = null;

function setup_zone2(sketch) {
    let canvas = sketch.createCanvas(wW, wH).parent('zone-two');
    let width = canvas.position().x;
    let height = canvas.position().y;
    sketch.fill("black");
    sketch.textSize(normalTS);
    sketch.strokeWeight(2);

    buttons.push(createCustomButton(sketch, "Reset", width, height +80, (e) => {
        e.stopPropagation();
        reset();
    }));
}

function draw_zone2(sketch) {
    sketch.background(200);
    sketch.textSize(normalTS);
    sketch.text("Triangulation", 30, 50);
    sketch.textSize(10);

    if (portalgon === null) return;
    if (triangulatedPortalgon === null)
        triangulatedPortalgon = triangulate(portalgon);
    else
        triangulatedPortalgon.draw(sketch);

    if (source !== null) {
        let embeddedSource = source[0].add(triangulatedPortalgon.fragments[source[1]].origin);
        sketch.text("s", embeddedSource.x, embeddedSource.y);
        embeddedSource.draw(sketch, "blue", 8);
    }
    if (destination !== null) {
        let embeddedDestination = destination[0].add(triangulatedPortalgon.fragments[destination[1]].origin);
        sketch.text("d", embeddedDestination.x, embeddedDestination.y);
        embeddedDestination.draw(sketch, "red", 8);
    }
    if (source === null || destination === null) {
        previewPointZone2 = new Point(sketch.mouseX, sketch.mouseY);
        let color = source === null ? "blue" : "red";
        previewPointZone2.draw(sketch, color, 8);
    } else
        previewPointZone2 = null;
}

function clickZone2() {
    if (previewPointZone2 === null) return;

    for (let i = 0; i < triangulatedPortalgon.fragments.length; i++) {
        let currentVert = triangulatedPortalgon.fragments[i].vertices;
        if (isInTriangle(
            currentVert[0].add(triangulatedPortalgon.fragments[i].origin),
            currentVert[1].add(triangulatedPortalgon.fragments[i].origin),
            currentVert[2].add(triangulatedPortalgon.fragments[i].origin),
            previewPointZone2
            )
        ) {
            if (source === null)
                source = [previewPointZone2.sub(triangulatedPortalgon.fragments[i].origin), i];
            else
                destination = [previewPointZone2.sub(triangulatedPortalgon.fragments[i].origin), i];
        }
    }
}

function reset() {
    source = null;
    destination = null;
}
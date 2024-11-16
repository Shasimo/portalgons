class Fragment {
    constructor(vertices) {
        this.origin = this.getOrigin(vertices);
        this.vertices = this.polygonToFragment(vertices);
    }

    draw(sketch, origin, fragmentId=null) {
        sketch.textSize(smallTS);
        for (let i = 0; i < this.vertices.length; i++) {
            let current = this.vertices[i].add(origin);
            sketch.ellipse(current.x, current.y, 4, 4);
            sketch.text(i, current.x, current.y);
        }

        if (fragmentId != null) {
            let center = this.getCenter();
            sketch.text(fragmentId, center.x + origin.x, center.y + origin.y);
        }
        sketch.textSize(normalTS);

        for (let i = 0; i < this.vertices.length; i++) {
            let j = (i + 1) % this.vertices.length;
            let coordi = this.vertices[i].add(origin);
            let coordj = this.vertices[j].add(origin);
            sketch.line(coordi.x, coordi.y, coordj.x, coordj.y);
        }
    }

    getVertexIndex(point, origin) {
        for (let i = 0; i < this.vertices.length; i++) {
            if (this.vertices[i].add(origin).equals(point)) return i;
        }
        return null;
    }

    getOrigin(input_vertices) {
        let minX = input_vertices[0].x;
        let minY = input_vertices[0].y;
        for (let i = 0; i < input_vertices.length; i++) {
            if (input_vertices[i].x < minX) minX = input_vertices[i].x;
            if (input_vertices[i].y < minY) minY = input_vertices[i].y;
        }
        return new Point(minX, minY);
    }

    getCenter() {
        let resX = 0;
        let resY = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            resX += this.vertices[i].x;
            resY += this.vertices[i].y;
        }
        return new Point(resX / this.vertices.length, resY / this.vertices.length);
    }

    polygonToFragment(input_vertices) {
        // input_vertices must already be CCW !
        let ret = [];
        for (let i = 0; i < input_vertices.length; i++) {
            ret.push(input_vertices[i].sub(this.origin));
        }
        return ret;
    }

    copy() {
        let ret = new Fragment([...this.vertices]);
        ret.origin = this.origin;
        return ret;
    }

    rotate(angle, origin) {
        let vert = this.vertices.map(x => x.rotate(angle, origin));
        this.origin = this.getOrigin(vert);
        this.vertices = this.polygonToFragment(vert);
        this.origin = new Point(Math.max(10, this.origin.x), Math.max(10, this.origin.y));
    }

    flip(edgeIdx1, edgeIdx2) {
        let mainVec = this.vertices[edgeIdx2].sub(this.vertices[edgeIdx1]);

        for (let i = 0; i < this.vertices.length; i++) {
            if (i === edgeIdx1 || i === edgeIdx2) continue;

            let angle = Math.abs(getAngleBetween(mainVec, this.vertices[i].sub(this.vertices[edgeIdx1])));
            this.vertices[i].rotate(2 * angle, this.vertices[edgeIdx1]);
        }
    }
}
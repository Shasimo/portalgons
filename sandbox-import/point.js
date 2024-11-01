class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // simulates bracket overload and keeps accessing '.x/y' available
        return new Proxy(this, {
            get(target, prop) {
                if (prop === "0") return target.x;
                if (prop === "1") return target.y;
                return target[prop]; // Allow normal property access
            },
        });
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    add(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Point(this.x - other.x, this.y - other.y);
    }

    log() {
        console.log("x: ", this.x, ", y: ", this.y);
    }
}

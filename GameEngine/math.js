class JSVector
{
    constructor(x = 0, y = 0) 
    {
        this.x = x; this.y = y;
    }

    set(x = 0, y = 0) {this.x = x; this.y = y;}

    addSelf(jsVector = new JSVector()) {this.x += jsVector.x; this.y += jsVector.y;}
    subTractSelf(jsVector = new JSVector()){this.x -= jsVector.x; this.y -= jsVector.y;}

    add(jSVector = new JSVector()){return new JSVector(this.x + jSVector.x, this.y + jSVector.y);}
    subtract(jSVector = new JSVector()){return new JSVector(this.x - jSVector.x, this.y - jSVector.y);}

    multiply(float = 0){return new JSVector(this.x * float, this.y * float);}
    divide(float = 0){return new JSVector(this.x / float, this.y * float);}

    multiplySelf(float = 0){this.x *= float; this.y *= float};
    divideSelf(float = 0){this.x *= float; this.y *= float};

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    equals(jsVector = new JSVector())
    {
        return this.x == jsVector.x && this.y == jsVector.y;
    }

    normalize() {
        let value = this.value;
        let mag = value.magnitude();
        if (mag !== 0) {
            value.x /= mag;
            value.y /= mag;
        }
        return value;
    }
    normalizeSelf() {
        let mag = this.magnitude();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }
    }

    get value()
    {
        return new JSVector(this.x, this.y);
    }

    static distance(a = new JSVector(), b = new JSVector())
    {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class JSColor {
    constructor(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}

class JSMath
{
    static RandomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class JSVector
{
    constructor(x = 0, y = 0) 
    {
        this.x = x; this.y = y;
    }

    set(x, y) {this.x = x; this.y = y;}

    addSelf(jsVector) {this.x += jsVector.x; this.y += jsVector.y;}
    subTractSelf(jsVector){this.x -= jsVector.x; this.y -= jsVector.y;}

    add(jSVector){return new JSVector(this.x + jSVector.x, this.y + jSVector.y);}
    subtract(jSVector){return new JSVector(this.x - jSVector.x, this.y - jSVector.y);}

    multiply(float){return new JSVector(this.x * float, this.y * float);}
    divide(float){return new JSVector(this.x / float, this.y * float);}

    multiplySelf(float){this.x *= float; this.y *= float};
    divideSelf(float){this.x *= float; this.y *= float};

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
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

    static distance(a, b)
    {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class JSMath
{
    static RandomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class JSTransform
{
    constructor(jsID)
    {
        this.jsID = jsID;
        this.parent = 0;
        this.localPosition = new JSVector();
    }

    get jsObject()
    {
        return null;
    }

    get Parent()
    {
        return this.parent == 0 ? null : null;
    }

    setParent(jsTransform)
    {
        this.parent = jsTransform;
    }

    get Position()
    {
        return this.Parent == null ? this.localPosition : this.localPosition.add(this.Parent.Position);
    }
}

class JSObject
{
    static objects = {};
    static ID()
    {
        let id;
        do {
            id = JSMath.RandomRange(-100000, 100000);
        } while (id in JSObject.objects || id == 0);
        return id;
    }

    static Get(id)
    {
        return JSObject.objects[id];
    }
    
    constructor()
    {
        this.jsID = JSObject.ID();
        this.element = null;
        this.transform = new JSTransform(this.jsID);
        this.children = [];
        this.component = undefined;
        this.static = true;

        // states
        this.activeSelf = true;

        JSObject.objects[this.jsID] = this;
    }

    get activeInHeirachy()
    {
        return this.transform.parent == 0 ? this.activeSelf : true;
    }

    get hasComponent() {return typeof this.component != 'undefined';}
    get hasElement() {return typeof this.element != 'undefined';}

    lockElement(element)
    {
        this.element = element;
    }

    destroyElement()
    {
        this.element.remove();
        this.children.forEach(child => {

        });
    }

    updateElement()
    {
        this.element.style.position = 'absolute';
        this.element.style.left = this.transform.Position.x + 'px';
        this.element.style.top = this.transform.Position.y + 'px';
    }

    updateComponent()
    {
        this.component.update();
    }

    update()
    {
        if(this.hasElement && !this.static)
        {
            this.updateElement();
        }
        if(this.hasComponent)
        {
            this.updateComponent();
        }
    }
}
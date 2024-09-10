class JSTransform
{
    constructor(jsID)
    {
        this.jsID = jsID;
        this.parent = 0;
        this.localPosition = new JSVector();
        this.sizeDelta = new JSVector();
    }

    get jsObject()
    {
        return JSObject.Get(this.jsID);
    }

    get Parent()
    {
        return this.parent == 0 ? null : JSObject.Get(this.parent).transform;
    }

    setParent(jsTransform)
    {
        this.parent = jsTransform;
    }

    get Position()
    {
        return this.Parent == null ? this.localPosition : this.localPosition.add(this.Parent.Position);
    }

    get LocalPosition()
    {
        return this.localPosition.value;
    }

    set LocalPosition(jsVector = new JSVector())
    {
        if(jsVector.equals(this.localPosition)) {return;}
        this.localPosition.set(jsVector.x, jsVector.y);
        this.jsObject.updateElement();
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

        /** @type {HTMLElement} */
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
        this.element.style.top = -this.transform.Position.y + 'px';
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

class JSComponent
{
    get ID()
    {
        return this.jsObject.jsID;
    }
    get color()
    {
        return this.element.style.color;
    }

    set color(color)
    {
        if(color instanceof JSColor)
        {
            this.color = color.toString();
        }else
        {
            this.element.style.color = color;
        }
    }

    get backgroundColor()
    {
        return this.element.style.backgroundColor;
    }

    set backgroundColor(color)
    {
        if(color instanceof JSColor)
        {
            this.backgroundColor = color.toString();
        }else
        {
            this.element.style.backgroundColor = color;
        }
    }

    get transform()
    {
        return this.jsObject.transform;
    }
    
    get element()
    {
        return this.jsObject.element;
    }

    get rect()
    {
        return this.element.getBoundingClientRect();
    }

    get rectPosition()
    {
        return new JSVector(rect.right, rect.top);
    }

    constructor()
    {
        this.jsObject = new JSObject();
        this.jsObject.component = this;
    }
    
    addElement()
    {
        const element = document.createElement('div');
        this.jsObject.lockElement(element);
    }

    appendToComponent(component = new JSComponent())
    {
        component.element.appendChild(this.element);
    }

    absolutePosition()
    {
        this.element.style.position = 'absolute';
    }

    relativePosition()
    {
        this.element.style.position = 'relative';
    }

    update()
    {

    }
}

class JSText extends JSComponent
{
    get text()
    {
        return this.element.textContent;
    }
    set text(string)
    {
        this.element.textContent = string;
    }

    constructor(parentID = 0)
    {
        super();
        const element = document.createElement('p');
        this.jsObject.lockElement(element);
        this.element.className = 'jsText';
        this.element.style.zIndex = 1000;

        gameDiv.appendChild(this.element);

        this.element.style.position = 'absolute';
        this.color = new JSColor(0, 0, 0).toString();
        this.jsObject.transform.setParent(parentID);
    }

}

class JSList extends JSComponent
{
    init = new JSVector();
    spacing = new JSVector();
    x = false;
    y = false;
    doVerticalLayout = false;
    padding = new JSPadding();
    frame = 0;
    
    /** @type {JSTransform[]} */
    content = [];

    constructor()
    {
        super();
        this.addElement();
    }

    update()
    {
        if (++this.frame < 10) { this.frame = 0; }
        if (this.frame == 0 && this.content.length > 0)
        {
            this.transform.sizeDelta = this.init.add(new JSVector(!this.x ? this.transform.sizeDelta.x : 0, !this.y ? this.transform.sizeDelta.y : 0));
            let next = new JSVector();
            if(this.content.length > 0)
            {
                for (let i = 0; i < this.content.length; i++)
                {
                    let rect = this.content[i];
                    this.transform.sizeDelta.addSelf(new JSVector(this.x ? rect.sizeDelta.x : 0, this.y ? rect.sizeDelta.y : 0).add(this.spacing));

                    if (this.doVerticalLayout)
                    {
                        rect.LocalPosition = next.add(new JSVector(this.padding.left - this.padding.right, this.padding.top - this.padding.bottom));
                        next.subTractSelf(new JSVector(0, this.doVerticalLayout ? rect.sizeDelta.y + this.spacing.y : 0));
                    }
                }
            }
        }
    }
}

class JSPadding
{
    top = 0; left = 0; right = 0; bottom = 0;
    constructor(top = 0, left = 0, right = 0, bottom = 0){this.top = top; this.left = left; this.right = right; this.bottom = bottom;}
}
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
        this.unit = 'px';

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
        this.element.style.left = this.transform.Position.x + this.unit;
        this.element.style.top = -this.transform.Position.y + this.unit;
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
    get unit(){return this.jsObject.unit;}; set unit(value = 'px'){this.jsObject.unit = value;}
    get radius()
    {
        return this.element.style.borderRadius;
    } set radius(value){this.element.style.borderRadius = value + this.unit;}
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
    
    get size()
    {
        return this.transform.sizeDelta;
    }

    set size(jsVector = new JSVector())
    {
        this.transform.sizeDelta = jsVector;
        this.element.style.width = jsVector.x + this.unit;
        this.element.style.height = jsVector.y + this.unit;
    }

    get width() {return this.element.style.width;}
    get halfWidth() 
    {
        const width = this.width;
        const numericValue = parseFloat(width);
        const unit = width.replace(numericValue, '');
        const halfValue = numericValue / 2;
        return halfValue + unit;
    }

    get padding() {return this.element.style.padding;}
    set padding(value) {this.element.style.padding = value;}

    get paddingWidth(){return this.element.style.paddingLeft + this.element.style.paddingRight;}
    set paddingWidth(value) {this.element.style.paddingLeft = value; this.element.style.paddingRight = value;}

    get paddingHeight(){return this.element.style.paddingTop + this.element.style.paddingBottom;}
    set paddingHeight(value) {this.element.style.paddingTop = value; this.element.style.paddingBottom = value;}

    get transform()
    {
        return this.jsObject.transform;
    }
    
    get element()
    {
        return this.jsObject.element;
    }

    get elementSize()
    {
        return new JSVector(this.rect.width, this.rect.height);
    }

    get rect()
    {
        return this.element.getBoundingClientRect();
    }

    get rectPosition()
    {
        return new JSVector(this.rect.right, this.rect.top);
    }

    constructor()
    {
        this.jsObject = new JSObject();
        this.jsObject.component = this;
        this.defaultDisplay = 'block';
    }
    
    addElement()
    {
        const element = document.createElement('div');
        this.jsObject.lockElement(element);
        this.defaultDisplay = this.element.style.display;
    }

    appendBody()
    {
        document.body.appendChild(this.element);
    }

    appendElement(element)
    {
        element.appendChild(this.element);
    }

    appendToComponent(component = new JSComponent())
    {
        this.transform.setParent(component.ID);
        component.element.appendChild(this.element);
        this.defaultDisplay = this.element.style.display;
    }

    absolutePosition()
    {
        this.element.style.position = 'absolute';
    }

    relativePosition()
    {
        this.element.style.position = 'relative';
    }

    staticPosition()
    {
        this.element.style.position = 'static';
    }

    setFlex(flexDirection = 'none', alignItems = 'none')
    {
        this.element.style.display = 'flex';
        this.element.style.flexDirection = flexDirection;
        this.element.style.alignItems = alignItems;
        this.defaultDisplay = this.element.style.display;
    }

    justifyItems(value){this.element.style.justifyItems = value;}
    justifyContent(value){this.element.style.justifyContent = value;}

    setWidth(value)
    {
        this.element.style.width = value;
    }

    setActive(state = true)
    {
        this.element.style.display = state ? this.defaultDisplay : 'none';
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

    get fontSize() {return this.element.style.fontSize;} set fontSize(value){this.element.style.fontSize = value;}

    constructor(parentID = 0)
    {
        super();
        const element = document.createElement('p');
        this.jsObject.lockElement(element);
        this.element.className = 'jsText';
        this.element.style.zIndex = 1000;

        gameDiv.appendChild(this.element);
        this.jsObject.transform.setParent(parentID);
    }

    autoWidth()
    {
        this.element.style.width = 'auto';
    }

}

class JSImage extends JSComponent
{
    get backgroundImage()
    {
        return this.element.src;
    }

    set backgroundImage(url)
    {
        this.element.src = url;
    }

    constructor()
    {
        super();
        const element = document.createElement('img');
        element.alt = '';
        this.jsObject.lockElement(element);
        this.size = new JSObject(50, 50);
    }

    setAspect()
    {
        let size = this.size;
        let min = Math.min(size.x, size.y);
        size.set(min, min);
        this.size = size;
        this.element.style.aspectRatio = 1;
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

class JSButton extends JSComponent
{
    get action(){return this.element.action};
    set action(value = function(){})
    {
        this.element.addEventListener('click', value);
    }

    get label()
    {
        return this.element.textContent;
    }
    set label(string)
    {
        this.element.textContent = string;
    }

    get fontSize() {return this.element.style.fontSize;} set fontSize(value){this.element.style.fontSize = value;}

    constructor()
    {
        super();
        const element = document.createElement('div');
        this.jsObject.lockElement(element);
        this.element.className = 'jsButton';
        this.element.style.zIndex = 900;
    }
}

class JSStopwatch
{
    constructor()
    {
        this.startTime = 0;
        this.endTime = 0;
        this.isStarted = false;
        this.isFinished = false;
    }

    get ElapsedMilliseconds()
    {
        if(!this.isStarted) {return 0;}
        if(!this.isFinished){return Date.now() - this.startTime;}
        return this.endTime - this.startTime;
    }

    start()
    {
        this.startTime = Date.now();
        this.endTime = 0;
        this.isStarted = true;
        this.isFinished = false;
    }

    stop()
    {
        this.endTime = Date.now();
        this.isFinished = true;
    }
}
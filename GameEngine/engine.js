class Time
{
    static{
        this.startTime = Date.now();
        this.timeMS = Time.startTime;
        this.deltaTime = 0.0;
    }

    static get time()
    {
        return Time.timeMS * 0.001;
    }

    static get FPS()
    {
        return 1.0 / Time.deltaTime;
    }

    static Update()
    {
        const currentTime = Date.now();
        const frameTime = currentTime - Time.startTime;
        Time.deltaTime = Math.max(0.001, (frameTime - Time.timeMS) * 0.001);
        Time.timeMS = frameTime;
    }
}


class GameEngine
{
    static {
        this.updateFunctions = [];
    }

    static Update()
    {
        Time.Update();
        Input.Update();

        Object.values(JSObject.objects).forEach(element => 
        {
            element.update();
        });
    }
}
class GameAudio
{
    static playMove() 
    {
        let audio = new Audio('Resources/Audio/move-self.mp3');
        audio.play();
    }
    static playCheck() 
    {
        let audio = new Audio('Resources/Audio/move-check.mp3');
        audio.play();
    }
    static playCapture() 
    {
        let audio = new Audio('Resources/Audio/capture.mp3');
        audio.play();
    }
}
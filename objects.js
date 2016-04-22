//
// OBJECT DECLARATION - BEGIN
//
var game = {};
var background = {};
var Player = {};
var gameArray = [];
var shotArray = [];
var fighterArray = [];
var fighterShotArray = [];


//
//   Game
//
function CreateGame() {
    this.gameID = 0,
    this.playerName = "",
    this.gameStatus = "new",    // new | running | paused | over
    this.gameResult = "",       // victory | defeated
    this.gameResultReason = "", // victory (time | caught) | defeated (time | caught) | cancelled 
    this.level = 1,
    this.startTime = new Date(),
    this.endTime = new Date(),
    this.runningTime = new Date(),
    this.gameTime = 0,
    this.totalPlayerShots = 0,
    this.totalFighters = 0,
    this.totalFightersShots = 0,
    this.totalFightersCaught = 0,
    // Game Objectives
    this.objectiveTime = 0,
    this.objectiveCaught = 0,
    //Performace matter: output on screen
    this.lastLifeCount = 0,
    this.lastFightersCount = 0,
    this.lastFightersCaughtCount = 0,
    this.lastRunningTime = new Date(),
    // Level configuration
    this.FighterInterval = 0,
    this.shotFighterInterval = 0,
    // General Options
    this.mainMessage = "",
    this.lastMainMessage = "",
    this.lastMessageTime = new Date(),
    //
    this.start = function(playerName, level, gameTime, objectiveTime, objectiveCaught){

        this.playerName = playerName;
        this.level = level;
        
        if (level===3) {        // Hard Level 
            this.FighterInterval = 77;
            this.shotFighterInterval = 97;
        } else if (level===2) { // Intermediate level
            this.FighterInterval = 157;
            this.shotFighterInterval = 111; //197;
        } else {                // Easy Level (default)
            this.FighterInterval = 257;
            this.shotFighterInterval = 297;
        }
        
        this.objectiveTime = objectiveTime;
        this.objectiveCaught = objectiveCaught;
        this.lastMessageTime = 0;
        
        this.gameTime = gameTime;
        this.startTime = Date.now();
        this.runningTime = this.startTime;
        this.lastRunningTime = -1;
        this.gameStatus = "running";
        
    }
    this.over = function(trigger, Player){

        this.endTime = Date.now();
        this.gameStatus = "over";
        
        // Check Result
        if (trigger==="playerCaught") {
            
            this.gameResult = "Defeated";
            this.gameResultReason = "Player caught";
            Player.LifeQty -= 1;
            
        } else if (trigger==="playerCancelled") {

            this.gameResult = "Defeated";
            this.gameResultReason = "Player surrendered";
            
        } else if (trigger==="timesUp" || trigger==="playerWin") {

            if (this.objectiveTime > 0) {
                //
                // Time is already OK
                //
                if (this.objectiveCaught > 0) {
                    //
                    if (this.totalFightersCaught >= this.objectiveCaught) {
                        this.gameResult = "Victory!";
                        this.gameResultReason = "Time & Caught objectives";
                    } else {
                        this.gameResult = "Defeated";
                        this.gameResultReason = "Missed Caught objective";
                    }
                } else { // No Caught Objective
                    this.gameResult = "Victory!";
                    this.gameResultReason = "Time objective";
                }
                //
            } else { // No Time Objective
                //
                //
                //
                if (this.objectiveCaught > 0) {
                    //
                    if (this.totalFightersCaught >= this.objectiveCaught) {
                        this.gameResult = "Victory!";
                        this.gameResultReason = "Caught objective";
                    } else {
                        this.gameResult = "Defeated";
                        this.gameResultReason = "Missed Caught objective";
                    }
                } else { // No Hit Objective
                    this.gameResult = "Error";
                    this.gameResultReason = "Please contact Game Admin!";
                }
            }
        }
        // Check Result

        // Check Image according to Result
        if (this.gameResult === "Victory!") {
            Player.imageObject.src = Player.imagePlayerVictory;
        } else if (this.gameResult === "Defeated") {
            Player.imageObject.src  = Player.imagePlayerDefeat;
        }
        Player.posX = Math.ceil(canvasAnimation.width/2) - Math.ceil(Player.imageObject.width/2);
        Player.posY = Math.ceil(canvasAnimation.height/2) - Math.ceil(Player.imageObject.height/2);
        
    }
} //CreateGame        

//
//   Background
//
function CreateBackground() {
    this.imageObject = new Image(),
    this.imageFile = "",
    this.width = 0,
    this.height = 0,
    this.frameSize = 1,
    this.numImages = 1,
    this.qtyFrames = 1,
    this.posFrame = 0,
    this.setup = function(image){
        
        //Load Image
        this.imageObject = image;
        this.imageFile = this.imageObject.src;
        ctxAnimation.drawImage(this.imageObject, 0, 0, this.imageObject.width, this.imageObject.height, 
                                                 0, 0, this.imageObject.width, canvasAnimation.height); // Adjust ONLY Height
        //
        
        this.width = this.imageObject.width;
        this.height = this.imageObject.height;
        //
        this.qtyFrames = Math.ceil(this.imageObject.width / this.frameSize) + 1;
        this.posFrame = 0;
        this.numImages = Math.ceil(canvasAnimation.width / this.imageObject.width) + 1;
        
    }
} //CreateBackground


//
//   Main Player (Ship)
//
function CreatePlayer() {
    this.imageObject = new Image(),
    this.imageFileLEFT = "",
    this.imageFileRIGHT = "",
    this.imageFileExplosion = "",
    this.spriteBlast = new Sprite(imgFileSpriteBlast,
                                       [0, 0],
                                       [39, 39],
                                       5,
                                       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                       null,
                                       true),        
    this.spriteExplosion = new Sprite(imgFileSpriteExplosion,
                                       [0, 0],
                                       [200, 200],
                                       5,
                                       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
                                       null,
                                       true),  
    this.posX = 0,
    this.posY = 0,
    this.width = 0,
    this.height = 0,
    this.moveX = 0,
    this.moveY = 0,
    this.currentDir = "",
    this.lastVerDir = "",
    this.lastHorDir = "",
    this.qtyVerMove = 0,
    this.LifeQty = 0,
    this.shotCount = 0,
    this.maxShots = 0,
    this.imageFileShotLEFT = "",
    this.imageFileShotRIGHT = "",
    this.shotImageTime = new Date(),    
    this.caught = false,
    this.caughtExplosion = false,
    this.gunSound = new Audio(),
    this.imagePlayerVictory = "",
    this.imagePlayerDefeat = "",
    this.setup = function(){
        
        //Initial Position
        this.posX = Math.ceil(canvasAnimation.width/2);
        this.posY = Math.ceil(canvasAnimation.height/2);
        
        //Load Images
        this.imageFileLEFT = resources.get(imgFileFalconL).src;
        this.imageFileRIGHT = resources.get(imgFileFalconR).src;
        this.imageFileExplosion = resources.get(imgFileExplosion).src;
        this.imagePlayerVictory = resources.get(imgFilePlayerVictory).src;
        this.imagePlayerDefeat = resources.get(imgFilePlayerDefeat).src;

        this.imageObject.src = this.imageFileRIGHT;
        //
        
        this.width = this.imageObject.width;
        this.height = this.imageObject.height;
        this.moveX = 5;
        this.moveY = 5;
        this.currentDir = "";
        this.lastVerDir = "";
        this.lastHorDir = "";
        this.qtyVerMove = 0;
        this.LifeQty = 1;
        this.shotCount = 0;
        this.maxShots = 10;
        
        this.gunSound = playerGun;
        this.shotImageTime = -1;
        
        this.caught = false;
        this.caughtExplosion = false;
        //
    }
} //CreatePlayer


//
//   Main Player Shot
//
function CreatePlayerShot() {
    this.imageObject = new Image(),
    this.imageFileLEFT = "",
    this.imageFileRIGHT = "",
    this.posX = 0,
    this.posY = 0,
    this.width = 0,
    this.height = 0,
    this.moveX = 0,
    this.moveY = 0,
    this.color = "",    
    this.active = false,
    this.setup = function(){

        this.width = 15;
        this.height = 3;
        this.moveX = 15;
        this.moveY = 3;
        this.color = "Gold";
        this.active = true;
        //
    }
}
//CreatePlayerShot


//   Enemies Fighter
function CreateEnemyFighter() {
    this.imageObject = new Image(),
    this.imageFileLEFT = "",
    this.imageFileRIGHT = "",
    this.spriteBlast = new Sprite(imgFileSpriteBlast,
                                       [0, 0],
                                       [39, 39],
                                       5,
                                       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                       null,
                                       true),        
    this.posX = 0,
    this.posY = 0,
    this.width = 0,
    this.height = 0,
    this.moveX = 0,
    this.moveY = 0,
    this.moveQty = 0,
    this.shotInterval = 0,
    this.currentDir = "",
    this.caught = false,
    this.fighterID = 0,
    this.gunSound = new Audio(),
    this.setup = function(fighterID, game){
        
        this.fighterID = fighterID;
        this.gunSound = fighterGun;
        
        //Load Image
        this.imageFileLEFT = resources.get(imgFileTIEfighterL).src;
        this.imageFileRIGHT = resources.get(imgFileTIEfighterR).src;

        // Random Side (left | right)
        var horizontalDir = Math.floor((Math.random() * 2) + 1);
        if (horizontalDir===1){
            this.currentDir = "right";
        } else {
            this.currentDir = "left";
        }
        
        if (this.currentDir==="left"){
            this.imageObject.src = this.imageFileLEFT;
        } else {
            this.imageObject.src = this.imageFileRIGHT;
        }
        //        
        
        this.width = this.imageObject.width;
        this.height = this.imageObject.height;
        this.moveX = 5; //speed
        this.moveY = 1;

        // Random Y position
        var positionY = Math.floor((Math.random() * canvasAnimation.height) + 1);
        
        if ( (positionY / canvasAnimation.height) > 0.8 ){
            this.moveY = -this.moveY; //up
        } else if ( (positionY / canvasAnimation.height) < 0.2 ){
            this.moveY = this.moveY; //down
        } else {
            // betwenn 0.1 & 0.9: random Y side
            var verticalDir = Math.floor((Math.random() * 2) + 1);
            if (verticalDir===1){
                this.moveY = this.moveY; //down
            } else {
                this.moveY = -this.moveY; //up
            }
        }
        
        if (this.currentDir==="left"){
            this.posX = canvasAnimation.width - (this.width + this.moveX);
            this.posY = positionY;
            this.moveX = -this.moveX;
        } else {
            this.posX = this.width + this.moveX;
            this.posY = positionY;
            this.moveX = this.moveX;
        }
        
        this.moveQty = 0;
        this.shotInterval = game.shotFighterInterval;
        //
    }
} //CreateEnemyFighter


//
//   Enemies Fighter Shot
//
function CreateFighterShot() {
    this.imageObject = new Image(),
    this.imageFileLEFT = "",
    this.imageFileRIGHT = "",
    this.posX = 0,
    this.posY = 0,
    this.width = 0,
    this.height = 0,
    this.moveX = 0,
    this.moveY = 0,
    this.color = "",    
    this.active = false,
    this.fighterID = 0;
    this.setup = function(fighterID){

        this.fighterID = fighterID;
        
        this.width = 3;
        this.height = 3;
        this.moveX = 4;
        this.moveY = 4;
        this.color = "Red";
        this.active = true;
        //
    }
} //CreateFighterShot

//
// OBJECT DECLARATION - END
//

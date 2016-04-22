//
// DECLARATIONS
//
var htmlBody = document.getElementById('htmlBody');

var canvasAnimation = document.getElementById("canvasAnimation");
var ctxAnimation = canvasAnimation.getContext("2d");

// ---------------------------------------------------------------------
// EXPLANATION: Why I declared one element for each single information:
//     I've read (actually I've experienced it) that DOM manipulation
//     (changes in innerHTML) during a animation loop really decreases 
//     the performace. It's a very heavy work for the Browser.
//     Indeed, The game only displays information when they are new.
//     Check out "showGameInfo" function.
// ---------------------------------------------------------------------

// Buttons
var btnNewGame = document.getElementById('btnNewGame');
var btnPauseResume = document.getElementById('btnPauseResume');
var btnEndGame = document.getElementById('btnEndGame');
var btnOptions = document.getElementById('btnOptions');
var btnJournal = document.getElementById('btnJournal');
var btnAbout = document.getElementById('btnAbout');

// Game Output Info
var canvasObjects = document.getElementById("canvasObjects");
var divCanvas1 = document.getElementById("divCanvas1");

var controlPanel = document.getElementById("controlPanel");
var outPlayerName = document.getElementById("outPlayerName");
var outGameLevel = document.getElementById("outGameLevel");
var outLifeQty = document.getElementById("outLifeQty");
var outPlayerLife = document.getElementById("outPlayerLife");
var outPlayerLifeBar = document.getElementById("outPlayerLifeBar");
var outGameNumber = document.getElementById("outGameNumber");
var outEnemiesCount = document.getElementById("outEnemiesCount");
var outEnemiesCaught = document.getElementById("outEnemiesCaught");
var outGameInfo = document.getElementById("outGameInfo");
var outGameTimer = document.getElementById("outGameTimer");
var outGameJournal = document.getElementById("outGameJournal");

// New Game "Window"
var inPlayerName = document.getElementById("inPlayerName");
var inGameLevel = document.getElementById("inGameLevel");
var inGameTime = document.getElementById("inGameTime");
var inObjectiveTime = document.getElementById("inObjectiveTime");
var inObjectiveCaught = document.getElementById("inObjectiveCaught");
var inObjectiveCaughtQTY = document.getElementById("inObjectiveCaughtQTY");
var newGameMessage = document.getElementById("newGameMessage");

// Options "Window"
var inOptLoopBackground = document.getElementById("inOptLoopBackground");
var inOptSounds = document.getElementById("inOptSounds");

// General Global Variables
var reqID = 0;
var isAnimating = false;
var optionLoopBackground = true;
var optionSounds = true;
var lastTime;

// Images Global Variables
var imgFileBackground       = 'images/starwars8.jpg';
var imgFileBackground_small = 'images/starwars8-small.jpg';
var imgFileFalconL          = 'images/falconL.png';
var imgFileFalconR          = 'images/falconR.png';
var imgFilePlayerVictory    = 'images/lightsaber_green_v.png';
var imgFilePlayerDefeat     = 'images/lightsaber_red_d.png';
var imgFileTIEfighterL      = 'images/TIEfighterL.gif';
var imgFileTIEfighterR      = 'images/TIEfighterR.gif';
var imgFileSpriteExplosion  = 'images/spriteExplosion.png';
var imgFileSpriteBlast      = 'images/spriteBlast.png';
var imgFileExplosion        = 'images/explosion.gif';



//
// MAIN
//

    //
    // INITIALIZE
    //
    resources.load([
        imgFileBackground,
        imgFileBackground_small,
        imgFileFalconL,
        imgFileFalconR,
        imgFilePlayerVictory,
        imgFilePlayerDefeat,
        imgFileTIEfighterL,
        imgFileTIEfighterR,
        imgFileSpriteExplosion,
        imgFileSpriteBlast,
        imgFileExplosion
    ]);
    resources.onReady(init);
    
    //
    // FUNCTIONS - LOOP CONTROL
    //
    function controlAnimation(status) {
        "use strict";
        
        isAnimating = status;

        if (isAnimating) {
            reqID = window.requestAnimationFrame(doAnimation);
        } else {
            window.cancelAnimationFrame(reqID);
        }
        
    }

    //
    function doAnimation() {
        "use strict";

        if (!isAnimating) {
            return;
        }
        
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        
        updateBackground(1, 1, "doAnimation");
        //
        controlGameProgress();
        movePlayer(dt);
        moveShot();
        createFighter();
        moveFighter(dt);
        moveFighterShot();
        //
        showGameInfo();
        //
        lastTime = now;
        requestAnimationFrame(doAnimation);
        
    }
    
    //
    // FUNCTIONS - UPDATE BACKGROUND
    //
    //
    function updateBackground(index, numFrames, source) {
        "use strict";
        
        var index = index;
        var numFrames = numFrames;
        
        if (!optionLoopBackground && source === "doAnimation") {
            // if loop Background is off AND is a 'doAnimation' calling, only render current Background frame
            index = 0;
            numFrames = 1;
        } else if (optionLoopBackground && source === "movePlayer") {
            // if loop Background is on, DO NOT scroll when asked by user 
            return;
        }
        
        for (var k=0; k < numFrames; k++) {
        
            if(background.posFrame > background.qtyFrames){
                background.posFrame = 0;
            } else if (background.posFrame <= 0) {
                background.posFrame = background.qtyFrames;
            }

            background.posFrame += index;
            
            renderBackground();
            
        }
    }

    //
    function renderBackground() {
        "use strict";
    
        var currentFrame = background.posFrame * background.frameSize % background.width;

        for (var i = 0; i < background.numImages; i++) {
            ctxAnimation.drawImage(background.imageObject,
                                   0, 0,
                                   background.width, background.height, 
                                   i * background.width - currentFrame, 0,
                                   background.width, canvasAnimation.height);
        }
    }


    //
    // FUNCTIONS - SETUP / RESET
    // 

    function init() {
        "use strict";
                
        resizeCanvas();
                
        background = new CreateBackground();
        Player = new CreatePlayer();
        
        if (window.innerHeight <= 768) {
            background.setup(resources.get(imgFileBackground_small));
        } else {
            background.setup(resources.get(imgFileBackground));
        }

        gameArray.splice(0,gameArray.length);
        
        // HTML Components
        htmlBody.addEventListener('keydown', function() {
            uniKeyCode(event);
        });
        
        btnNewGame.addEventListener('click', function() {
            setGameControls(btnNewGame, 'new');
        });    
        
        btnPauseResume.addEventListener('click', function() {
            setGameControls(btnPauseResume, 'pauseResume');
        }); 
        
        btnEndGame.addEventListener('click', function() {
            setGameControls(btnEndGame, 'askEnd');
        }); 
        
        btnOptions.addEventListener('click', function() {
            setGameControls(btnOptions, 'options');
        });
        
        btnJournal.addEventListener('click', function() {
            setGameControls(btnJournal, 'journal');
        });        
        
        btnAbout.addEventListener('click', function() {
            setGameControls(btnAbout, 'about');
        });
        
        window.addEventListener('resize', resizeCanvas);
    
        setGameControls(btnNewGame, "init");
        
    }

    //
    // FUNCTIONS - OBJECTS MOVEMENTS CONTROL 
    //
    function uniKeyCode(event) {
        var key = event.keyCode;
        
        if (Player.caught || game.gameStatus !== "running") {
            return;
        }
        
        var charKey = String.fromCharCode(key);

        //
        if (key===37 || charKey==="J") {
            
            Player.currentDir = "left";
            Player.lastHorDir = Player.currentDir;
            
        } else if (key===38 || charKey==="I") {
            
            Player.currentDir = "up";
            Player.lastVerDir = Player.currentDir;
            Player.qtyVerMove = Player.qtyVerMove - 1;
            
        } else if (key===39 || charKey==="L") {
            
            Player.currentDir = "right";
            Player.lastHorDir = Player.currentDir;
            
        } else if (key===40 || charKey==="K") {
            
            Player.currentDir = "down";
            Player.lastVerDir = Player.currentDir;
            Player.qtyVerMove = Player.qtyVerMove + 1;
            
        } else if (key===32 || charKey==="C") {
            createShot("regular");
            
        } else if (charKey==="S") {
            createShot("up");
            
        } else if (charKey==="X") {
            createShot("down");
            
        }
    }

    //
    function movePlayer(dt) {
        "use strict";
        
        if (game.gameStatus === "over") {
            // Display Victory or Defeat Image
            ctxAnimation.drawImage(Player.imageObject, Player.posX, Player.posY);
            return;
        }

        if (game.gameStatus !== "running") {
            return;
        }
        
        //
        // Move Player caught (explosion)
        //
        if (Player.caught) {
            
            if (!Player.caughtExplosion) {
                Player.caughtExplosion = true;
                controlSounds(Player, "explosion");
            }
    
            // Render Explosion till Player disapears in the bottom of the screen
            if ((Player.posY + Player.height + Player.moveY) < canvasAnimation.height + 100) {
                
                if (Player.spriteExplosion._index < Player.spriteExplosion.frames.length) {
                    Player.spriteExplosion.update(dt);
                    Player.spriteExplosion.render(ctxAnimation, Player.posX, Player.posY);
                }
            
                Player.posY = Player.posY + Player.moveY;
                Player.qtyVerMove++;
                
            } else {
                game.over("playerCaught", Player);
                setGameControls(btnEndGame, "over");
            }
            return;
        }
        
        //
        // Move Player
        //
        if (Player.currentDir==="left") {
            if (Player.posX - Player.moveX > 0 ) {
                Player.posX = Player.posX - Player.moveX;
            } else {
                updateBackground(-1, 2, "movePlayer");
            }
        }
        else if (Player.currentDir==="up") {
            if (Player.posY - Player.moveY > 0 ) {
                Player.posY = Player.posY - Player.moveY;
                Player.qtyVerMove--;
            }
        }
        else if (Player.currentDir==="right") {
            if (Player.posX + Player.width + Player.moveX < canvasAnimation.width ) {
                Player.posX = Player.posX + Player.moveX;
            } else {
                updateBackground(1, 2, "movePlayer");
            }
        }
        else if (Player.currentDir==="down") {
            if ((Player.posY + Player.height + Player.moveY) < canvasAnimation.height) {
                Player.posY = Player.posY + Player.moveY;
                Player.qtyVerMove++;
            }
        }

        //
        // Caught by some Fighter shot?
        //
        for(var i=0; i < fighterShotArray.length; i++) {
            if (fighterShotArray[i].active) {
                if (checkCollision (Player.posX,
                                    Player.posY,
                                    Player.width,
                                    Player.height,
                                    fighterShotArray[i].posX,
                                    fighterShotArray[i].posY,
                                    fighterShotArray[i].width,
                                    fighterShotArray[i].height) ) {
                        Player.shotCount++;
                        checkPlayerCaught(dt);
                        fighterShotArray[i].active = false;
                        game.mainMessage = "Oh No! Hit by a Fighter!"
                        controlSounds(Player, "bomb");
                }
            }
        }
        //
        
        //
        // Collides to some Fighter?
        //
        for(var i=0; i < fighterArray.length; i++) {
            if (!fighterArray[i].caught) {
                if (checkCollision (Player.posX,
                                    Player.posY,
                                    Player.width,
                                    Player.height,
                                    fighterArray[i].posX,
                                    fighterArray[i].posY,
                                    fighterArray[i].width,
                                    fighterArray[i].height) ) {
                        Player.shotCount+=3; //#TODO: SET PARAMETER
                        checkPlayerCaught(dt);
                        figherCaught(i);
                        game.mainMessage = "COLLISION! You lost 3 levels of Life!"
                        controlSounds(Player, "bomb");
                }
            }
        }
        //
        
        //
        // Render the Player: Check which image to display: direction (left or right)
        //
        if (!Player.caught) {
            if (Player.lastHorDir==="left") {
                Player.imageObject.src = Player.imageFileLEFT;
            } else {
                Player.imageObject.src = Player.imageFileRIGHT;
            }
            ctxAnimation.drawImage(Player.imageObject, Player.posX, Player.posY);

            //
            // Check if Player is in "Shot Time": diplays the Blast in this case.
            //
            if (Player.shotImageTime !== -1) {
                //
                Player.spriteBlast.update(dt);
                Player.spriteBlast.render(ctxAnimation, Player.posX, Player.posY);
                //
                if (game.runningTime - Player.shotImageTime > 2) {
                    Player.shotImageTime = -1;
                } 
            }
        }
        //

    }
    
    //
    function createShot(type) {
        "use strict";
        //
        
        if (Player.caught) {
            return;
        }
            
        var playerShot = new CreatePlayerShot();
        
        playerShot.setup();
        
        playerShot.posX = Player.posX+(Player.width);
        playerShot.posY = Player.posY+(Player.height/2);

        if (Player.lastHorDir==="left"){
            playerShot.posX = playerShot.posX-(Player.width/2);
        }
        
        if (type==="regular") {
            
            if (Player.lastHorDir==="left"){
                playerShot.moveX = -playerShot.moveX;
            }

            if (Player.currentDir==="left" || Player.currentDir==="right") {
                playerShot.moveY = 0;
            }
            else if (Player.lastVerDir==="down"){
                playerShot.moveY = -playerShot.moveY;
            }
        }
        else {
            
            var aux = playerShot.width;
            playerShot.width = playerShot.height;
            playerShot.height = aux;
            
            if (type==="up") {
                playerShot.moveY = -playerShot.moveX;
            }
            else { //down
                playerShot.moveY = playerShot.moveX;
            }
            
            playerShot.moveX = 0;

        }

        shotArray.push(playerShot);
        game.totalPlayerShots++;
        controlSounds(Player, "shot");

    }

    //
    function moveShot() {
        "use strict";
        //
        
        for(var i=0; i < shotArray.length; i++) {

            shotArray[i].posX = shotArray[i].posX + shotArray[i].moveX;
            shotArray[i].posY = shotArray[i].posY + shotArray[i].moveY;

            if (shotArray[i].active) {
                ctxAnimation.fillStyle = shotArray[i].color;
                ctxAnimation.fillRect(shotArray[i].posX,
                                      shotArray[i].posY, 
                                      shotArray[i].width,
                                      shotArray[i].height);
            }

            if ( checkOUTBounds(shotArray[i]) ){
                 shotArray.splice(i,1);
            }
            
        }
    }
    
    //
    function checkPlayerCaught(dt){
        "use strict";
        
        if(Player.caught){
            return;
        }
        
        if (Player.shotCount >= Player.maxShots) {
            Player.shotCount = Player.maxShots;
            Player.currentDir = "down";
            Player.moveX = 0;
            Player.moveY = 2;
            Player.posY = Player.posY - 50; //Adjust accordint to Explosion Sprite Image
            Player.caught = true;
            //
            Player.spriteExplosion._index = 0;
            Player.spriteExplosion.update(dt);
            Player.spriteExplosion.render(ctxAnimation, Player.posX, Player.posY);
            //
            Player.shotImageTime = game.runningTime;
        } else {
            Player.spriteBlast._index = 0;
            Player.spriteBlast.update(dt);
            Player.spriteBlast.render(ctxAnimation, Player.posX, Player.posY);
            //
            Player.shotImageTime = game.runningTime;
        }
        
    }             
    
    //
    function createFighter() {
        "use strict";
        //
        
        var randomNumber = Math.floor((Math.random() * 1000) + 1);
        if (randomNumber % game.FighterInterval !== 0) {
            return;
        }
        
        var enemyFighter = new CreateEnemyFighter();
        
        game.totalFighters++;
        enemyFighter.setup(game.totalFighters, game);
        
        fighterArray.push(enemyFighter);
        
    }
    
    //
    function moveFighter(dt) {
        "use strict";
        //
    
        for(var i=0; i < fighterArray.length; i++) {
            
            fighterArray[i].posX = fighterArray[i].posX + fighterArray[i].moveX;
            fighterArray[i].posY = fighterArray[i].posY + fighterArray[i].moveY;
            
            //
            // Caught by some Player shot?
            //
            if (!fighterArray[i].caught) {
                for(var j=0; j < shotArray.length; j++) {
                    if (shotArray[j].active) {
                        if (checkCollision (fighterArray[i].posX,
                                            fighterArray[i].posY,
                                            fighterArray[i].width,
                                            fighterArray[i].height,
                                            shotArray[j].posX,
                                            shotArray[j].posY,
                                            shotArray[j].width,
                                            shotArray[j].height) ) {
                            shotArray[j].active = false;
                            figherCaught(i);
                            game.mainMessage = "GOT IT!!!"
                            controlSounds(fighterArray[i], "bomb");
                        }
                    }
                }
            }
            //
            
            //
            // Collides to another Fighter?
            //
            if (!fighterArray[i].caught) {
                for(var j=0; j < fighterArray.length; j++) {
                    if (!fighterArray[j].caught) {
                        if (fighterArray[i].fighterID !== fighterArray[j].fighterID) { // can't get same Fighter!
                            if (checkCollision (fighterArray[i].posX,
                                                fighterArray[i].posY,
                                                fighterArray[i].width,
                                                fighterArray[i].height,
                                                fighterArray[j].posX,
                                                fighterArray[j].posY,
                                                fighterArray[j].width,
                                                fighterArray[j].height) ) {
                                figherCaught(i);
                                figherCaught(j);
                                controlSounds(fighterArray[i], "bomb");
                            }
                        }
                    }
                }
            }
            //
            
            //
            // Caught by another Fighter's shot?
            //
            if (!fighterArray[i].caught) {
                for(var j=0; j < fighterShotArray.length; j++) {
                    if (fighterArray[i].fighterID !== fighterShotArray[j].fighterID) { // can't get same Fighter's shot!
                        if (fighterShotArray[j].active) {
                            if (checkCollision (fighterArray[i].posX,
                                                fighterArray[i].posY,
                                                fighterArray[i].width,
                                                fighterArray[i].height,
                                                fighterShotArray[j].posX,
                                                fighterShotArray[j].posY,
                                                fighterShotArray[j].width,
                                                fighterShotArray[j].height) ) {
                                fighterShotArray[j].active = false;
                                figherCaught(i);
                                controlSounds(fighterArray[i], "bomb");
                            }
                        }
                    }
                }
            }
            //
            
            if (fighterArray[i].caught) {
                //
                fighterArray[i].spriteBlast.update(dt);
                fighterArray[i].spriteBlast.render(ctxAnimation, fighterArray[i].posX, fighterArray[i].posY);
                
            } else {
                //
                ctxAnimation.drawImage(fighterArray[i].imageObject, fighterArray[i].posX, fighterArray[i].posY);
                // Create Figher Shot
                if ( fighterArray[i].moveQty % fighterArray[i].shotInterval===0 ){
                    createFighterShot(fighterArray[i]);
                }
            }
            
            fighterArray[i].moveQty++;

            if ( checkOUTBounds(fighterArray[i]) ){
                 fighterArray.splice(i,1);
            }
            
        }
    }
    
    //
    function createFighterShot(fighter) {
        "use strict";
        //
        
        var fighterShot = new CreateFighterShot();

        var PlayerPosX = Player.posX+(Player.width);
        var PlayerPosY = Player.posY+(Player.height/2);
        
        fighterShot.setup(fighter.fighterID);
        
        fighterShot.posX = fighter.posX+(fighter.width);
        fighterShot.posY = fighter.posY+(fighter.height/2);
        
        var xDiff = Math.abs(fighterShot.posX - PlayerPosX);
        var yDiff = Math.abs(fighterShot.posY - PlayerPosY);
        var angleY = Math.atan2(yDiff, xDiff);
        var angleX = Math.atan2(xDiff, yDiff);
        
        angleY = toDegree(angleY);
        angleX = toDegree(angleX);
        angleY = angleY / 45;
        angleX = angleX / 45;
        
        fighterShot.moveX = fighterShot.moveX * angleX;
        if(fighterShot.posX > PlayerPosX){
            fighterShot.moveX = -fighterShot.moveX;
        }

        fighterShot.moveY = fighterShot.moveY * angleY;
        if(fighterShot.posY > PlayerPosY){
            fighterShot.moveY = -fighterShot.moveY;
        }
        
        fighterShotArray.push(fighterShot);
        controlSounds(fighter, "shot");
        
    }
    
    //
    function moveFighterShot() {
        "use strict";
        //
        
        for(var i=0; i < fighterShotArray.length; i++) {
            
            fighterShotArray[i].posX = fighterShotArray[i].posX + fighterShotArray[i].moveX;
            fighterShotArray[i].posY = fighterShotArray[i].posY + fighterShotArray[i].moveY;
            
            if (fighterShotArray[i].active) {
                
                ctxAnimation.fillStyle = fighterShotArray[i].color;
                var circle = new Path2D();
                circle.arc(fighterShotArray[i].posX, fighterShotArray[i].posY, fighterShotArray[i].width, 0, 2 * Math.PI);
                ctxAnimation.fill(circle);

            }

            if ( checkOUTBounds(fighterShotArray[i]) ){
                 fighterShotArray.splice(i,1);
            }
        }
    }    
    
    //
    function figherCaught(i){
        "use strict";
        
        fighterArray[i].caught = true;
        
        if (Player.caught || game.gameStatus !== "running") {
            return;
        }
        
        game.totalFightersCaught++;
    }
    
    //
    function checkOUTBounds(movingObject) {
        "use strict";
        
        //Check Bounds
        if ( ((movingObject.posX + movingObject.width + movingObject.moveX) > canvasAnimation.width) ||
             ((movingObject.posX + movingObject.width + movingObject.moveX) < 0 )) {
              return true;
        } else
        if ( ((movingObject.posY + movingObject.height + movingObject.moveY) > canvasAnimation.height) ||
             ((movingObject.posY + movingObject.height + movingObject.moveY) < 0 )) {
              return true;
        }
        return false;
    }
        
    //
    function checkCollision( x, y, w, h, x2, y2, w2, h2 ){
        "use strict";
        
        var r = x + w;
        var b = y + h;
        var r2 = x2 + w2;
        var b2 = y2 + h2;
        
        if (!(r <= x2 || x > r2 || b <= y2 || y > b2)) {
            return true;
        }
        return false;
    }

    //
    function controlGameProgress() {
        "use strict";
        
        if (Player.caught || game.gameStatus !== "running") {
            return;
        }

        game.runningTime = (Date.now() - game.startTime) / 1000;
        
        var remainingTime = (game.gameTime * 60) - game.runningTime;
        
        if (remainingTime <= 0){
            game.over("timesUp", Player);
            setGameControls(btnEndGame, "over");
            return;
        }

        // Check ONLY Caught Objective
        if (game.objectiveCaught > 0 && game.objectiveTime===0) {
            if (game.totalFightersCaught >= game.objectiveCaught) {
                game.over("playerWin", Player);
                setGameControls(btnEndGame, "over");   
            }
        }

    }

    //
    function showGameInfo (){
        "use strict";

        if (game.gameStatus === "over") {
            outLifeQty.value = "Lifes: " + Player.LifeQty;
            return;
        }
        
        if (game.gameStatus !== "running") {
            return;
        }
        
        // Only Init Info
        if (game.lastRunningTime === -1) { // it means First Time!
            outPlayerName.value = "Player: " + game.playerName;
            outGameLevel.value = "Level: " + game.level;
            outLifeQty.value = "Lifes: " + Player.LifeQty;
            
            var objTime = "none";
            if (game.objectiveTime > 0) {
                objTime = "yes";
            }
            var objCaught = "none";
            if (game.objectiveCaught > 0) {
                objCaught = game.objectiveCaught;
            }
            outGameNumber.value = "#Game: " + gameArray.length;
            outObjectiveTime.value = "Time Objective: " + objTime;
            outObjectiveCaught.value = "Caught Objective: " + objCaught;
            //outEnemiesCount.value = "Total Enemies: ";
            outEnemiesCaught.value = "Enemies caught: ";
            outGameInfo.value = "";
        }
        
        // Life Level
        if (game.lastLifeCount !== (Player.maxShots - Player.shotCount)){
            game.lastLifeCount = Player.maxShots - Player.shotCount;
            if (game.lastLifeCount < 0) {
                game.lastLifeCount = 0;
            }
            outPlayerLife.value = "Life Level: " + ((game.lastLifeCount / Player.maxShots) * 100) + "%";
            outPlayerLifeBar.style.display = 'inline';
            outPlayerLifeBar.value = (game.lastLifeCount / Player.maxShots) * 100;
        }

        // Total Fighters
        //if (game.lastFightersCount !== game.totalFighters){
        //    game.lastFightersCount = game.totalFighters;
        //    outEnemiesCount.value = "Total Enemies: " + game.lastFightersCount;
        //}
                
        // Total Fighters Caught
        if (game.lastFightersCaughtCount !== game.totalFightersCaught){
            game.lastFightersCaughtCount = game.totalFightersCaught;
            outEnemiesCaught.value = "Enemies caught: " + game.lastFightersCaughtCount;
        }

        // Timer
        if ( game.runningTime - game.lastRunningTime >= 1 ) {
            
            var remainingTime = (game.gameTime * 60) - game.runningTime;
            var m = addZero(Math.floor(remainingTime / 60));
            var s = addZero(Math.floor(remainingTime % 60));
            
            outGameTimer.value = m + ":" + s;
            game.lastRunningTime = game.runningTime;
        }
        
        // Game Messages
        if (game.mainMessage !== game.lastMainMessage ) {
            game.lastMainMessage = game.mainMessage;
            outGameInfo.value = game.lastMainMessage;
            game.lastMessageTime = game.runningTime;
        }
        
        if ( game.runningTime - game.lastMessageTime >= 2) {
            if (game.mainMessage === game.lastMainMessage ) {
                game.mainMessage = "";
                outGameInfo.value = game.mainMessage;
            }
            game.lastMessageTime = game.runningTime;
        }
        
    }

    //
    // FUNCTIONS - CONTROL PANEL 
    //
    function setGameControls(button, command) {
        "use strict";
        
        if (typeof(button) === "object") {
            button.blur();
        }
        if (typeof(canvasAnimation) === "object") {
            canvasAnimation.focus();
        }

        // Init
        if (command==="init") {
            
            controlAnimation(false);
            renderBackground();
            
            newGamewWindow.style.display = 'none';
            newGameMessage.innerHTML = "";
            msgBoxWindow.style.display = 'none';
            optionsWindow.style.display = 'none';
            journalWindow.style.display = 'none';
            helpAboutWindow.style.display = 'none';
            canvasObjects.style.display = 'block';
            
            btnNewGame.disabled = false;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = false;
            btnJournal.disabled = false; 
            btnAbout.disabled = false; 
            
            optionLoopBackground = inOptLoopBackground.checked;
            optionSounds = inOptSounds.checked;

        } else if (command==="new") {

            controlAnimation(false);
            
            btnNewGame.disabled = true;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = true;
            btnJournal.disabled = true; 
            btnAbout.disabled = true;
            
            newGamewWindow.style.display = 'block';
            newGameMessage.innerHTML = "";
            canvasObjects.style.display = 'none';
            
        } else if (command==="start") {
            
            //
            // SET VARIABLES TO START THE GAME
            //
            
            var okToStart = true;
            
            //Validations
            if (inPlayerName.value===""){
                newGameMessage.innerHTML = "<p> Player's name cannot be null! </p>";
                okToStart = false;
            } if (!inObjectiveTime.checked && !inObjectiveCaught.checked) {
                newGameMessage.innerHTML = "<p> You must select at least one objective! </p>";
                okToStart = false;
            }
            
            if (okToStart) {
                
                newGamewWindow.style.display = 'none';
                newGameMessage.innerHTML = "";
                canvasObjects.style.display = 'block';
                canvasAnimation.focus();
                
                //
                Player.setup();
                shotArray.splice(0,shotArray.length);
                fighterArray.splice(0,fighterArray.length);
                fighterShotArray.splice(0,fighterShotArray.length);

                var objectiveTime = 0;
                if (inObjectiveTime.checked){
                    objectiveTime = Number(inGameTime.value);
                }
                var objectiveCaught = 0;
                if (inObjectiveCaught.checked){
                    objectiveCaught = Number(inObjectiveCaughtQTY.value);
                }
                
                game = new CreateGame();
                game.start (inPlayerName.value, Number(inGameLevel.value), Number(inGameTime.value), objectiveTime, objectiveCaught);
                gameArray.push(game);

                //
                btnNewGame.disabled = true;
                btnPauseResume.disabled = false;
                btnEndGame.disabled = false; 
                btnOptions.disabled = true;
                btnJournal.disabled = true; 
                btnAbout.disabled = true; 
                
                //
                controlAnimation(true);
                //
            }
            
        } else if (command==="pauseResume") {
            
            //
            if (isAnimating) {
                controlAnimation(false);
                btnPauseResume.value = "Resume Game";
                btnEndGame.disabled = true; 
            } else {
                controlAnimation(true);
                btnPauseResume.value = "Pause Game";
                btnEndGame.disabled = false; 
            }
            
        } else if (command==="askEnd") {

            controlAnimation(false);

            btnNewGame.disabled = true;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = true;
            btnJournal.disabled = true; 
            btnAbout.disabled = true;
            
            msgBoxWindow.style.display = 'block';
            canvasObjects.style.display = 'none';
            
        } else if (command==="endConfirmed") {
            
            //
            controlAnimation(false);
            renderBackground();
            
            msgBoxWindow.style.display = 'none';
            canvasObjects.style.display = 'block';
            canvasAnimation.focus();
            
            btnNewGame.disabled = false;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = false;
            btnJournal.disabled = false; 
            btnAbout.disabled = false;
            //
            
            game.over("playerCancelled", Player);
            setGameControls(btnEndGame, "over");
                
            //
        } else if (command==="endCancelled") {
            
            msgBoxWindow.style.display = 'none';
            canvasObjects.style.display = 'block';
            canvasAnimation.focus();
            
            btnNewGame.disabled = true;
            btnPauseResume.disabled = false;
            btnEndGame.disabled = false; 
            btnOptions.disabled = true;
            btnJournal.disabled = true; 
            btnAbout.disabled = true;
            
            controlAnimation(true);
            
        } else if (command==="over") { // (Gave Over)
            
            //
            //controlAnimation(false);
            
            var str =   "Game Over!" + "\n" +
                        "Result: " + game.gameResult + "\n" +
                        "Reason: " + game.gameResultReason + "\n" +
                        "Game Time: " + Math.ceil(game.runningTime) + " sec. \n" +
                        "Fighters Caught: " + game.totalFightersCaught;
            outGameInfo.value = str;
                        
            btnNewGame.disabled = false;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = false;
            btnJournal.disabled = false; 
            btnAbout.disabled = false; 
            //
            
        } else if (command==="options") {
            
            controlAnimation(false);

            btnNewGame.disabled = true;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = true;
            btnJournal.disabled = true; 
            btnAbout.disabled = true;
            
            optionsWindow.style.display = 'block';
            canvasObjects.style.display = 'none';
            
        } else if (command==="journal") {
            
            controlAnimation(false);

            btnNewGame.disabled = true;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = true;
            btnJournal.disabled = true; 
            btnAbout.disabled = true;
            
            journalWindow.style.display = 'block';
            canvasObjects.style.display = 'none';
            
            displayGameJournal();
            
        } else if (command==="about") {
            
            controlAnimation(false);

            btnNewGame.disabled = true;
            btnPauseResume.disabled = true;
            btnEndGame.disabled = true; 
            btnOptions.disabled = true;
            btnJournal.disabled = true; 
            btnAbout.disabled = true;
            
            helpAboutWindow.style.display = 'block';
            canvasObjects.style.display = 'none';
            
        }
        
    }

    //
    function displayGameJournal() {
        "use strict";
        
        if (gameArray.length===0) {
            outGameJournal.innerHTML = "No Games yet!";
            return;
        }
        
        var strMatrix = "";
        var objTime = "";
        var objCaught = "";
        
        outGameJournal.innerHTML = "";
        
        strMatrix = "<br/> <table id='resultTable'>";

        for (var i=0; i < gameArray.length; i++){
            if(i===0){
                strMatrix += "<tr>";
                strMatrix += "<th> # </th>";
                strMatrix += "<th> Player </th>";
                strMatrix += "<th> Level </th>";
                strMatrix += "<th> Result </th>";
                strMatrix += "<th> Reason </th>";
                strMatrix += "<th> Game Time </th>";
                strMatrix += "<th> Time Played </th>";
                strMatrix += "<th> Time Obj. </th>";
                strMatrix += "<th> Total Fighters </th>";
                strMatrix += "<th> Fighters Caught </th>";
                strMatrix += "<th> Caught Obj. </th>";
                strMatrix += "</tr>";
            }
            //
            objTime = "none";
            if (gameArray[i].objectiveTime > 0) {
                objTime = "yes";
            }
            objCaught = "none";
            if (gameArray[i].objectiveCaught > 0) {
                objCaught = gameArray[i].objectiveCaught;
            }            
            //
            strMatrix += "<tr>";
            strMatrix += "<td>" + (i+1) + "</td>";
            strMatrix += "<td>" + gameArray[i].playerName + "</td>";
            strMatrix += "<td>" + gameArray[i].level + "</td>";
            strMatrix += "<td>" + gameArray[i].gameResult + "</td>";
            strMatrix += "<td>" + gameArray[i].gameResultReason + "</td>";
            strMatrix += "<td>" + (gameArray[i].gameTime * 60) + " sec." + "</td>";
            strMatrix += "<td>" + (Math.ceil(gameArray[i].runningTime)) + " sec." + "</td>";
            strMatrix += "<td>" + objTime + "</td>";
            strMatrix += "<td>" + gameArray[i].totalFighters + "</td>";
            strMatrix += "<td>" + gameArray[i].totalFightersCaught + "</td>";
            strMatrix += "<td>" + objCaught + "</td>";
            strMatrix += "</tr>";
        }

        strMatrix += "</table>";

        outGameJournal.innerHTML = strMatrix;        
        
    }

    function controlSounds(object, type) {
        "use strict";
        
        if (!optionSounds) {
            return;
        }
        
        if (game.gameStatus !== "running") {
            return;
        }
        
        if (type==="shot") {
            object.gunSound.play();
        } else if (type==="bomb") {
            bomb.play();
        } else if (type==="explosion") {
            explosion.play();
        }   

    }
             

    //
    // FUNCTIONS - GENERAL PURPOSE 
    //

    //
    function toRad(angleDegree) {
        "use strict";
        //
        var angleRad = 0;
        angleRad = angleDegree * (Math.PI / 180);
        return angleRad;
    }

    //
    function toDegree(angleRad) {
        "use strict";
        //
        var angleDegree = 0;
        angleDegree = angleRad / (Math.PI / 180);
        return angleDegree;
    }
    
    //
    function isValidNumber(inputNum, validMin, validMax) {
        "use strict";
        //
        if ( isNaN(inputNum) || inputNum < validMin || inputNum > validMax) {
            return false;
        }
        return true;
    }
    
    //
    function addZero(i) {
        "use strict";
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    
    //
    function resizeCanvas() {
        "use strict";
        //
        
        var auxisAnimating = isAnimating;
        
        if (isAnimating){
            isAnimating = false;
        }
        
        var panelAbsoluteHeight = 160;
        var canvasHeight = window.innerHeight - panelAbsoluteHeight;
        
        if (canvasHeight <= 0) {
            canvasHeight = window.innerHeight;
        }
        
        //
        canvasAnimation.width = window.innerWidth;
        canvasAnimation.height = canvasHeight;
        
        canvasObjects.style.top = '0px';
        canvasObjects.style.width = window.innerWidth + 'px';
        canvasObjects.style.height = canvasHeight + 'px';
        //
        divCanvas1.style.top = '0px';
        divCanvas1.style.width = window.innerWidth + 'px';
        divCanvas1.style.height = canvasHeight + 'px';

        controlPanel.style.top = canvasHeight + 'px';
        controlPanel.style.width = window.innerWidth + 'px';
        controlPanel.style.height = panelAbsoluteHeight + 'px';
        
        if (auxisAnimating){
            isAnimating = true;
        }
        
    }





const URL = `https://neocage.azurewebsites.net/api`;
//const URL = `http://localhost:7071/api`;

let currentGame = {};

let gamemodes = [];

const max_stroke_dasharray = 283;

function convertSeconds(seconds) {
    time = Number(seconds);
    var m = Math.floor(time % 3600 / 60);
    var s = Math.floor(time % 3600 % 60);

    var mDisplay = m > 9 ? m : `${0}${m}`;
    var sDisplay = s > 9 ? s : `${0}${s}`;
    
    return `${mDisplay}:${sDisplay}`;

};
//#region ***  DOM references ***
let htmlGamemodeList, htmlGameDesc, htmlGameStart, htmlScoreboard, htmlStartpage, htmlGamepage, htmlGameTitle;
let htmlPopupGame, htmlPopupLoading, htmlPopups = [], htmlSaveButton, htmlInputName;
let htmlStatusTitle, htmlTimercircle, htmlTimerSeconds, htmlStatusCards, htmlGameStop, htmlPopupEnd, htmlEndTitle, htmlEndCards;
//#endregion

//#region ***  Helper functions ***
const redirectToStartpage = function() {
    document.location.href = "./index.html";
}

const redirectToGamepage = function() {
    document.location.href = "./game.html";
}

function formatTimeLeft(time) {
    const minutes = Math.floor(time / 60);
    
    let seconds = time % 60;
    
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    
    return `${minutes}:${seconds}`;
}
//#endregion

//MQTT Client
client = new Paho.MQTT.Client("13.81.105.139", 80, "")

//#region ***  Game Functions ***
const startGame = (game) => {
    let body = JSON.stringify(game)
    console.log(`> Game '${game.name}' wordt gestart...`)

    showLoadingPopup();
    handleData(`${URL}/game/start`,showGameStarted, errorGameStarted, 'POST', body);
};

const stopGame = () => {
    console.log(`> Stop commando wordt verstuurd...`)

    showLoadingPopup();
    handleData(`${URL}/game/stop`, callbackGameStopped, errorStopGame, 'POST');
};
//#endregion

//#region ***  Callback-Visualisation - show___ ***
const showGameStarted = function(data){
    console.log(`- Game '${data.gamemode}' succesvol gestart.`);
    // hideLoadingPopup();
    redirectToGamepage();
}

const showGamemodes = (data) => {
    console.log("- Gamemodes succesvol opgehaald.");
    hideLoadingPopup();

    let listcontent = "";

    gamemodes = data;

    for(let i in data) {
        gamemode = data[i];
        let description, duration, id, name, released;

        description = gamemode.description;
        duration = gamemode.duration;
        id = gamemode.id;
        name = gamemode.name;
        released = gamemode.released;

        listcontent += `<li class="c-gamemode js-gamemode" data-index=${i}>${name}</li>`; 

    };

    htmlGamemodeList.innerHTML = listcontent;

    listenToGamemodes();
};


const showGamemodeInfo = (gamemode) => {
    hideLoadingPopup();

    htmlGameTitle.innerHTML = gamemode.name;
    htmlGameDesc.innerHTML = gamemode.description;

    htmlGameStart.addEventListener("click",function(){
        startGame(gamemode);
    });
};


const showHighscores = (data) => {
    console.log("- Highscores succesvol opgehaald.");
    hideLoadingPopup();

    let htmlString = "";

    if(data.length < 1){
        htmlString = `<tr class="c-table__row">
        <td class="c-table__item">No Highscores Available (yet)</td>
    </tr> `;
    }else{
        data.forEach((highscore) => {
            let username, score;
            
            username = highscore.username;

    
            switch(highscore.gamemode_id) {
                case 'quickytricky':    
                    score = `${highscore.score} ptn`;
                    break;
                case 'doubletrouble':
                    score = convertSeconds(highscore.score);
                    break;
                case 'therondo':
                    score = `00:${highscore.score}`
                    break;
                default:
                    break;
            }
    
            htmlString += `<tr class="c-table__row">
            <td class="c-table__item">${username}</td>
            <td class="c-table__item">${score}</td>
        </tr> `; 
    
        });
    };

   

    htmlScoreboard.innerHTML = htmlString;
};

const showPopup = function(htmlPopup) {
    htmlPopup.classList.add("c-popup--shown");
}

const showTimer = function(startTime, duration) {
    // Als er een duration is
    if (duration != null) {
        let endTime = startTime + (duration * 1000);

        const timer = setInterval(function() {
            let now = Date.now();

            let stroke_dasharray, timerText;
            // Check is starttime has passed
            if (startTime > now) {
                // How many ms left till start?
                let msTillStart = startTime - now;
                // How many s left till start?
                let sTillStart = Math.ceil(msTillStart / 1000);

                stroke_dasharray = 0;
                timerText = sTillStart;
            }
            else {
                // How many ms left?
                let msTillEnd = endTime - now;
                // How many s left?
                let sTillEnd = Math.ceil(msTillEnd / 1000);

                // Calculate circle elapsed stroke
                stroke_dasharray = msTillEnd / (duration*1000) * max_stroke_dasharray;
                if (stroke_dasharray < 0) {
                    stroke_dasharray = 0;
                }
                if (msTillEnd < 0) {
                    clearInterval(timer);
                }

                timerText = sTillEnd;
            }

            htmlTimercircle.setAttribute("stroke-dasharray", `${stroke_dasharray} ${max_stroke_dasharray}`);
            htmlTimerSeconds.innerHTML = timerText;
        }, 30);
    }
    else {
        // duration = null, toon verstreken tijd
        const timer = setInterval(function() {
            // One circle every 60 seconds
            duration = 60;

            let now = Date.now();
            // How many (milli)seconds have passed since the start
            let msPassed = (now - startTime);
            let sPassed = Math.ceil(msPassed / 1000);
    
            let stroke_dasharray = (msPassed / (duration*1000) * max_stroke_dasharray) % max_stroke_dasharray;
    
            htmlTimercircle.setAttribute("stroke-dasharray", `${stroke_dasharray} ${max_stroke_dasharray}`);
            htmlTimerSeconds.innerHTML = sPassed;
        }, 30);
    }
}

const showGameStatus = function(game) {
    console.log("- Game status wordt geupdate.");
    hideLoadingPopup();

    htmlStatusTitle.innerHTML = game.gamemode;

    console.log(htmlStatusCards);
    let cardsContent = "";

    // SCORE
    if(game.gamemode == "doubletrouble"){
        let score = game.score;
        let player_1 = Math.floor(score / 10);
        let player_2 = score % 10;

        cardsContent +=
            `<div class="c-minicards">
                            <div class="c-minicard">
                                <h2 class="c-subtitle u-alpha-textcolor">Speler 1</h2>
                                <h5 class="c-card__value u-alpha-textcolor">${player_1}</h5>
                            </div>
                            <div class="c-minicard">
                                <h2 class="c-subtitle u-beta-textcolor">Speler 2</h2>
                                <h5 class="c-card__value u-beta-textcolor">${player_2}</h5>
                            </div>
                        </div>`;
    } else {
        cardsContent +=
        `<div class="c-card o-container">
        <h2 class="c-subtitle">Score</h2>
        <h5 class="c-card__value">${game.score}</h5>
        </div>`;
    }

    

    let startTime = new Date(game.timestarted).getTime();

    showTimer(startTime, game.duration);

    htmlStatusCards.innerHTML = cardsContent;

    listenToStopButton();
}

const showEndOfGame = function(game) {
    console.log("- Game eindoverzicht wordt getoond.");
    hideLoadingPopup();

    showPopup(htmlPopupEnd);

    // Fill popup
    htmlEndTitle.innerHTML = game.gamemode;
    
    let cardsContent = "";
    // SCORE
    if(game.gamemode == "doubletrouble"){
        let score = game.score;
        let player_1 = Math.floor(score / 10);
        let player_2 = score % 10;

        cardsContent +=
            `<div class="c-minicards">
                            <div class="c-minicard">
                                <h2 class="c-subtitle u-alpha-textcolor">Speler 1</h2>
                                <h5 class="c-card__value u-alpha-textcolor">${player_1}</h5>
                            </div>
                            <div class="c-minicard">
                                <h2 class="c-subtitle u-beta-textcolor">Speler 2</h2>
                                <h5 class="c-card__value u-beta-textcolor">${player_2}</h5>
                            </div>
                        </div>`;
    } else {
        cardsContent +=
        `<div class="c-card o-container">
        <h2 class="c-subtitle">Score</h2>
        <h5 class="c-card__value">${game.score}</h5>
        </div>`;
    }

    htmlEndCards.innerHTML = cardsContent;

        //Save Button
    htmlSaveButton.addEventListener("click",function(){
        if(htmlInputName.innerText){
            let username = htmlInputName.innerText
            console.log(username);
    
            //username toevoegen aan de game
            game.username = username;
            //game stringifyen tot RequestBody
            let body = JSON.stringify(game)
            console.log("> Game wordt geupdate met gebruikersnaam.");
    
            handleData(`${URL}/games`,handleGameSaved, errorGameSaved, 'PUT', body);
            showLoadingPopup();
            } else {
                console.log("Vul een username in aub.")
            }
    
        });
    
        //Skip Button

}

const showLoadingPopup = function() {
    htmlPopupLoading.classList.add("c-popup--shown");
}

const hideLoadingPopup = function() {
    htmlPopupLoading.classList.remove("c-popup--shown");
}

const showError = function(title, msg) {
    console.error(title, "-", msg)

    const errorTitle = htmlPopupError.querySelector('.js-error-title');
    const errorMsg = htmlPopupError.querySelector('.js-error-msg');
    errorTitle.innerHTML = title;
    errorMsg.innerHTML = msg;

    showPopup(htmlPopupError);
}
//#endregion

//#region ***  Callback-No visualization - callback__ ***
const callbackGameStopped = function() {
    console.log("- Game succesvol gestopt.");
    redirectToStartpage();
}
//#endregion

//#region ***  Callback-Errors - Error___ ***
const errorGamemodes = () => {
    hideLoadingPopup();
    showError("Er ging iets fout.", "Gamemodes konden niet worden opgehaald.")
};
    
const errorCurrentGame = () => {
    hideLoadingPopup();
    currentGame = {};
    showError("Er ging iets fout.", "Kon huidige game informatie niet ophalen.")
};

const errorGameStarted = () => {
    hideLoadingPopup();
    showError("Er ging iets fout.", "Game kon niet worden gestart.")
};

const errorStopGame = () => {
    hideLoadingPopup();
    showError("Er ging iets fout.", "Game kon niet worden gestopt.")
};

const errorHighscores = () => {
    hideLoadingPopup();
    showError("Er ging iets fout.", "Highscores konden niet worden opgehaald.")
}
//#endregion


const errorGameSaved = () => {
    showError("Er ging iets fout.", "Highscore kon niet worden opgeslagen.")
}
    
//#region ***  Event Handlers - Handle___ ***

const handleGameSaved = (data) => {
    console.log("- Highscore succesvol opgeslagen.");
    redirectToStartpage();
    //redirect naar homepage
}



const handleCurrentGame = (data) => {
    /* Is er een game? */
    console.log("> Is er een game?");

    if (data.id) {
        console.log("- Ja");
        currentGame = data;
    }
    else {
        console.log("- Nee");
        currentGame = null;
    }

    if (currentGame != null) {
        // Er is een game
        if (htmlGamepage) {
            // Gamegegevens enz. inladen
            initGamepage();
        }
        else if (htmlStartpage) {
            // Doorsturen naar de gamepagina
            redirectToGamepage();
        }
    }
    else {
        // Er is GEEN game
        if (htmlGamepage) {
            // Doorsturen naar de startpagina.
            redirectToStartpage();
        }
    }
};
    
const handleMQTTData = function(payload) {
    let type = payload.type
    
    console.log(`+ Bericht ontvangen van de backend type '${type}'`)

    if (htmlStartpage) {
        if (type == "game_start") {
            redirectToGamepage();
        }
    }

    if (htmlGamepage) {
        if (type == "game_end" || type == "game_update") {
            let data = JSON.parse(payload.payload);
    
            currentGame = data;
            // Game status updaten
            showGameStatus(currentGame);

            if (type == "game_end") {
                // Popup met eindoverzicht vullen en tonen
                showEndOfGame(currentGame);
            }
        }

        if (type == "game_stop") {
            redirectToStartpage();
        }
    }
};
//#endregion

//#region ***  Event Listeners - ListenTo___ ***
const listenToGamemodes = function() {
    const buttons = document.querySelectorAll(".js-gamemode")

    for(let btn of buttons) {
        btn.addEventListener("click",function(){
            const gamemode = gamemodes[btn.dataset.index]
            getHighscores(gamemode.id); 
            showGamemodeInfo(gamemode)

            showPopup(htmlPopupGame)
        })
    }
};

const listenToPopupsClose = function() {
    // Go trough all the popups
    for (const popup of htmlPopups) {
        // Search for their closing button
        const closeButton = popup.querySelector(".js-popup-close");

        // If it's closable (has a button), add the event
        if (closeButton) {
            closeButton.addEventListener("click", function() {
                popup.classList.remove("c-popup--shown");
            });
        }
    }
}

const listenToStopButton = function() {
    htmlStopGame.removeEventListener("click", stopGame);
    htmlStopGame.addEventListener("click", stopGame);
}

const listenToMQTTConnect = function() {
    console.log("+ Verbonden met MQTT");
    client.subscribe("/neocage");
};
            
// called when a message arrives on the topic
const listenToMQTTMessage = function(message) {
    let topic = message.destinationName;
    let payload = JSON.parse(message.payloadString);
                
    // console.log("MQTT bericht ontvangen op " + topic)   
    handleMQTTData(payload);
};

client.onMessageArrived = listenToMQTTMessage;
//#endregion

//#region ***API-Calls - Get___ ***
const getGamemodes = async () => {
    console.log("> Gamemodes ophalen...")
    showLoadingPopup();
    handleData(`${URL}/gamemodes`,showGamemodes, errorGamemodes);  
};
          
const getAllGamemodes = async () => {   
    console.log("> ALLE gamemodes ophalen...")
    showLoadingPopup();
    handleData(`${URL}/gamemodes/all`,showGamemodes, errorGamemodes); 
};

const getCurrentGame = async () => {
    console.log("> Huidige game ophalen...")
    showLoadingPopup();
    handleData(`${URL}/games/current`, handleCurrentGame, errorCurrentGame);
};

const getHighscores = (gamemodeId) => {
    console.log("> Highscores voor gamemode ophalen...")
    showLoadingPopup();
    handleData(`${URL}/games/${gamemodeId}`,showHighscores, errorHighscores);
};
//#endregion
    
//#region ***  INIT / DOMContentLoaded  ***
const initStartpage = function() {
    getGamemodes();

    client.connect({onSuccess:listenToMQTTConnect});
}

const initGamepage = function() {
    showGameStatus(currentGame);

    client.connect({onSuccess:listenToMQTTConnect});
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("+ DOM LOAD COMPLETE")

    htmlStartpage = document.querySelector('.js-startpage');
    htmlGamepage = document.querySelector('.js-gamepage');

    htmlPopupError = document.querySelector('.js-popup-error');

    /* Startpage elements */
    htmlGamemodeList = document.querySelector('.js-gamemodes');
    htmlGameTitle = document.querySelector('.js-game-title');
    htmlGameDesc = document.querySelector('.js-game-desc');
    htmlGameStart = document.querySelector('.js-game-start');
    htmlScoreboard = document.querySelector('.js-scoreboard');
    htmlPopupGame = document.querySelector('.js-popup-game');
    htmlPopupLoading = document.querySelector('.js-popup-loading');

    /* Gamepage elements */
    htmlStatusTitle = document.querySelector('.js-status-title');
    htmlTimercircle = document.querySelector('.js-timer-circle');
    htmlTimerSeconds = document.querySelector('.js-timer-seconds');
    htmlStatusCards = document.querySelector('.js-status-cards');
    htmlStopGame = document.querySelector('.js-stop');
    htmlPopupEnd = document.querySelector('.js-popup-end');
    htmlEndTitle = document.querySelector('.js-end-title');
    htmlEndCards = document.querySelector('.js-end-cards');
    htmlSaveButton = document.querySelector('.js-input-submit');
    htmlInputName = document.querySelector('.js-input-name');
    

    if (htmlStartpage) {
        htmlPopups = [htmlPopupGame, htmlPopupLoading, htmlPopupError];
        initStartpage();
    } else if (htmlGamepage) {
        htmlPopups = [htmlPopupEnd, htmlPopupLoading, htmlPopupError];
    }

    listenToPopupsClose();

    getCurrentGame();
});
//#endregion
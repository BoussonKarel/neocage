const URL = `https://neocage.azurewebsites.net/api`;
// const URL = `http://localhost:7071/api`;

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
let htmlPopupGame, htmlPopupLoading, htmlPopups = [];
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
    console.log("Er wordt een game gestart: ", body)

    showLoadingPopup();
    handleData(`${URL}/game/start`,showGameStarted, errorGameStarted, 'POST', body);
};

const stopGame = () => {
    handleData(`${URL}/game/stop`,console.log("Game Stopped"), errorStopGame, 'POST');
    currentGame = {};
};
//#endregion


//#region ***  Callback-Visualisation - show___ ***


const showGameStarted = function(data){
    console.log("Game succesfully started!", data)
}


const showGamemodes = (data) => {
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

    htmlGameTitle.innerHTML = gamemode.name;
    htmlGameDesc.innerHTML = gamemode.description;

    htmlGameStart.addEventListener("click",function(){
        startGame(gamemode);
    })
};


const showHighscores = (data) => {
    let htmlString = "";
    console.log("highscores tonen")

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
    let endTime = startTime + (duration * 1000);

    const timer = setInterval(function() {
        let now = Date.now();

        // Compare to now, how many seconds till the endTime?
        let msTillEnd = endTime - now;
        

        let sTillEnd = Math.ceil(msTillEnd / 1000);

        let stroke_dasharray = msTillEnd / (duration*1000) * max_stroke_dasharray;
        if (stroke_dasharray < 0) {
            stroke_dasharray = 0;
        }
        if (msTillEnd < 0) {
            clearInterval(timer);
        }

        htmlTimercircle.setAttribute("stroke-dasharray", `${stroke_dasharray} ${max_stroke_dasharray}`);
        htmlTimerSeconds.innerHTML = sTillEnd;
    }, 30);
}

const showGameStatus = function(game) {
    console.log("Showing game:", game)
    htmlStatusTitle.innerHTML = game.gamemode;

    console.log(htmlStatusCards);
    let cardsContent = "";

    // SCORE
    cardsContent +=
        `<div class="c-card o-container">
            <h2 class="c-subtitle">Score</h2>
            <h5 class="c-card__value">${game.score}</h5>
        </div>`;

    let startTime = new Date(game.timestarted).getTime();

    showTimer(startTime, game.duration);

    htmlStatusCards.innerHTML = cardsContent;
}

const showEndOfGame = function(game) {
    showPopup(htmlPopupEnd);

    // Fill popup
    htmlEndTitle.innerHTML = game.gamemode;
    
    let cardsContent = "";
    // SCORE
    cardsContent +=
        `<div class="c-card o-container">
            <h2 class="c-subtitle">Score</h2>
            <h5 class="c-card__value">${game.score}</h5>
        </div>`;

    htmlEndCards.innerHTML = cardsContent;
}

const showLoadingPopup = function() {
    htmlPopupLoading.classList.add("c-popup--shown");
}

const hideLoadingPopup = function() {
    htmlPopupLoading.classList.remove("c-popup--shown");
}
//#endregion

//#region ***  Callback-Errors - Error___ ***

const errorGameStarted = () => {
    console.log("Game kon niet worden gestart")
}

const errorGamemodes = () => {
    console.log(`De gamemodes konden niet worden opgehaald.`)
};
    
const errorCurrentGame = () => {
    currentGame = {};
    console.log("Er is een fout opgetreden bij het ophalen van de huidige game")
};

const errorGame = () => {
    console.log("Het spel kon niet gestart worden")
};

const errorStopGame = () => {
    console.log("Game kon niet gestopt worden, er is een fout opgetreden.")
};

const errorHighscores = () => {
    console.log("De highscores konden niet worden opgehaald")
}
//#endregion

    
//#region ***  Event Handlers - Handle___ ***
const handleCurrentGame = (data) => {
    /* Is er een game? */
    console.log(data);

    if (data.id) {
        console.log("There is an active game");
        currentGame = data;
    }
    else {
        console.log("No game");
        currentGame = null;
    }

    if (currentGame != null) {
        // Er is een game
        console.log("Er is een game.");
        if (htmlGamepage) {
            console.log("Je zit op de gamepagina, gamegegevens inladen...");
            initGamepage();
        }
        else if (htmlStartpage) {
            console.log("Je zit op de startpagina, doorsturen naar gamepagina.");
            redirectToGamepage();
        }
    }
    else {
        // Er is GEEN game
        console.log("Er is geen game.");
        if (htmlStartpage) {
            console.log("Je zit op de startpagina. Er veranderd niets.");
        }
        else if (htmlGamepage) {
            console.log("Je zit op de gamepagina, doorsturen naar de startpagina.");
            redirectToStartpage();
        }
    }
};
    
const handleMQTTData = function(payload) {
    let type = payload.type

    if (type == "game_end" || type == "game_update") {
        let data = JSON.parse(payload.payload);

        currentGame = data;
        showGameStatus(currentGame);

        switch(type) {
            case 'game_end':
                console.log('De game is gedaan.')
                // Extra shit bij einde game
                showEndOfGame(currentGame);
                break;
            case 'game_update':
                console.log('De game is geupdate.')
                break;
            default:
                break;
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

const listenToMQTTConnect = function() {
    console.log("Connected to MQTT");
    client.subscribe("/neocage");
};
            
// called when a message arrives on the topic
const listenToMQTTMessage = function(message) {
    let topic = message.destinationName;
    let payload = JSON.parse(message.payloadString);
                
    console.log("MQTT Message arrived on " + topic)
                
    handleMQTTData(payload);
};

client.onMessageArrived = listenToMQTTMessage;
//#endregion

//#region ***API-Calls - Get___ ***
const getGamemodes = async () => {
    handleData(`${URL}/gamemodes`,showGamemodes, errorGamemodes);  
};
          
const getAllGamemodes = async () => {   
    handleData(`${URL}/gamemodes/all`,showGamemodes, errorGamemodes); 
};

const getCurrentGame = async () => {
    handleData(`${URL}/games/current`, handleCurrentGame, errorCurrentGame);
};

const getHighscores = (gamemodeId) => {
    handleData(`${URL}/games/${gamemodeId}`,showHighscores, errorHighscores);
};
//#endregion
    
//#region ***  INIT / DOMContentLoaded  ***
const initStartpage = function() {
getGamemodes();
}

const initGamepage = function() {
    showGameStatus(currentGame);

    client.connect({onSuccess:listenToMQTTConnect});
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM LOAD COMPLETE")

    htmlStartpage = document.querySelector('.js-startpage');
    htmlGamepage = document.querySelector('.js-gamepage');

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
    htmlGameStop = document.querySelector('.js-game-stop');
    htmlPopupEnd = document.querySelector('.js-popup-end');
    htmlEndTitle = document.querySelector('.js-end-title');
    htmlEndCards = document.querySelector('.js-end-cards');

    if (htmlStartpage) {
        htmlPopups = [htmlPopupGame, htmlPopupLoading];
        initStartpage();
    } else if (htmlGamepage) {
        htmlPopups = [htmlPopupEnd];
    }

    listenToPopupsClose();

    getCurrentGame();
});
//#endregion
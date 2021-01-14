const URL = `http://localhost:7071/api`;

let currentGame = {};

//#region ***  DOM references ***
let htmlGamemodeList, htmlGameDesc, htmlGameStart, htmlScoreboard, htmlStartpage, htmlGamepage;
let htmlPopupGame, htmlPopupCountdown, htmlPopups = [];
let htmlStatusGame, htmlCardsholder, htmlGameStop, htmlPopupEnd;
//#endregion

//#region ***  Helper functions ***
function convertSeconds(seconds) {
    time = Number(seconds);
    var m = Math.floor(time % 3600 / 60);
    var s = Math.floor(time % 3600 % 60);

    var mDisplay = m > 9 ? m : `${0}${m}`;
    var sDisplay = s > 9 ? s : `${0}${s}`;
    
    return `${mDisplay}:${sDisplay}`;
};

const redirectToStartpage = function() {
    document.location.href = "./index.html";
}

const redirectToGamepage = function() {
    document.location.href = "./game.html";
}
//#endregion

//MQTT Client
client = new Paho.MQTT.Client("13.81.105.139", 80, "")

//#region ***  Game Functions ***
const startGame = (game) => {
    currentGame = getCurrentGame();
    if(currentGame == {}){
        currentGame = game;
        
    } else {
        console.log("Er is al een game bezig.")
    }

};

const stopGame = () => {
    handleData(`${URL}/game/stop`,console.log("Game Stopped"), ErrorStopGame, 'POST');
    currentGame = {};
};
//#endregion


//#region ***  Callback-Visualisation - show___ ***
const showGame = (data) => {
    console.log(data)
    console.log("game bezig")
};


const showGamemodes = (data) => {
    data.forEach((gamemode) => {
        let description, duration, id, name, released;

        description = gamemode.description;
        duration = gamemode.duration;
        id = gamemode.id;
        name = gamemode.name;
        released = gamemode.released;

        htmlGamemodeList.innerHTML += `<li class="c-gamemode js-gamemode">${name}</li>`;
    });
};

const showAllGamemodes = (data) => {
    // console.log(data)
    data.forEach((gamemode) => {
        let description, duration, id, name, released;
    
        description = gamemode.description;
        duration = gamemode.duration;
        id = gamemode.id;
        name = gamemode.name;
        released = gamemode.released;
    });
};

const showGamemodeInfo = (gamemode) => {
    //Naam en spelregels van de gamemode tonen
    console.log(`Gamemode : ${gamemode}`)

    htmlGameTitle.innerHTML = gamemode.name;
    htmlGameDesc.innerHTML = gamemode.description;

    //Speluitleg tonen
    
    getHighscores(gamemode.id);
          
    // de Game starten
};


const showHighscores = (data) => {
    let htmlString = '';

    data.forEach((highscore) => {
        console.log(highscore)
        let username, score;
        
        username = highscore.username;

        switch(highscore.gamemode) {
            case 'quickytricky':    
                score = highscore.score;
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

        htmlString += ` <tr class="c-table__row">
        <td class="c-table__item>${username}</td>
        <td class="c-table__item>${score}</td>
        </tr>`  
    });

    htmlScoreboard.innerHTML += htmlString;
};

const showPopup = function(htmlPopup) {
    htmlPopup.classList.add("c-popup--shown");
}

const showGameStatus = function(game) {
    htmlStatusGame.innerHTML = game.gamemode;

    console.log(htmlCardsholder);
    let cardsContent = "";

    // TIJD
    if (game.duration == null) {
        cardsContent += `<div class="c-card">
                <h2 class="c-subtitle">Verstreken tijd</h2>
                <h5 class="c-card__value">XX:XX</h5>
            </div>`;
    }
    else {
        cardsContent += `<div class="c-card">
                <h2 class="c-subtitle">Resterende tijd</h2>
                <h5 class="c-card__value">YY:YY</h5>
            </div>`;
    }

    // SCORE
    cardsContent +=`<div class="c-card">
            <h2 class="c-subtitle">Score</h2>
            <h5 class="c-card__value">${game.score}</h5>
        </div>`;

    htmlCardsholder.innerHTML = cardsContent;
}

const showEndOfGame = function(game) {
    showPopup(htmlPopupEnd);

    // Fill popup
}
//#endregion

//#region ***  Callback-Errors - Error___ ***
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
    handleData(`${URL}/gamemodes/all`,showAllGamemodes, errorGamemodes); 
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
    htmlScoreboard = document.querySelector('js-scoreboard');
    htmlPopupGame = document.querySelector('.js-popup-game');
    htmlPopupCountdown = document.querySelector('.js-popup-countdown');

    /* Gamepage elements */
    htmlStatusGame = document.querySelector('.js-status-game');
    htmlCardsholder = document.querySelector('.js-cards-holder');
    htmlGameStop = document.querySelector('.js-game-stop');
    htmlPopupEnd = document.querySelector('.js-popup-end');

    if (htmlStartpage) {
        htmlPopups = [htmlPopupGame, htmlPopupCountdown];
        initStartpage();
    } else if (htmlGamepage) {
        htmlPopups = [htmlPopupEnd];
    }

    listenToPopupsClose();

    getCurrentGame();
});
//#endregion
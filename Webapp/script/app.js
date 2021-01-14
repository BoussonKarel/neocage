const URL = `https://neocage.azurewebsites.net/api`;

let currentGame = {};

//#region ***  DOM references ***
let htmlGamemodeList, htmlGameDesc, htmlGameStart, htmlScoreboard, htmlStartpage, htmlGamepage;
let htmlPopupGame, htmlPopupCountdown, htmlPopups = [];
let htmlCardsholder, htmlGameStop, htmlPopupEnd;
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
//#endregion

//MQTT Client
client = new Paho.MQTT.Client("13.81.105.139", 80, "")

//#region ***  Game Functions ***
const startGame = (game) => {
    currentGame = getCurrentGame();
    if(currentGame == {}){
        currentGame = game;
        handleData(`${URL}/game/start`,showGame(currentGame), ErrorGame, 'POST', game);
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

handleButtons();

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

        htmlString += ` <tr>
        <td>${username}</td>
        <td>${score}</td>
        </tr>`  
    });

    htmlScoreboard.innerHTML += htmlString;
};
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
    currentGame = data;

    if (data == null) {
        /* Geen game, homepage */
        if (htmlStartpage) {
            /* Gebruiker zit juist */
            console.log("We bevinden ons op de startpagina.");
            initStartpage();
        }
        else {
            /* Gebruiker zit fout */
            console.log("We bevinden ons op de startpagina, maar moeten hier niet zijn!");
        }
    }
    else {
        /* Wel een game, gamepage */
        if (htmlGamepage) {
            /* Gebruiker zit juist */
            console.log("We bevinden ons op de gamepagina.");
            initGamepage();
        }
        else {
            /* Gebruiker zit fout */
            console.log("We bevinden ons op de gamepagina, maar moeten hier niet zijn!");
        }
    }
};
    
const handleMQTTData = function(payload) {
    let type = payload.type
        
    let data = JSON.parse(payload.payload);
    console.log(data)

    switch(type) {
        case 'game_end':
            console.log('De game is gedaan')
            break;
        case 'game_update':
                //Hier wat er moet gebeuren
            console.log('Er is een Game Update uitgevoerd')
            break;
        default:
            break;
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
    htmlPopups = [htmlPopupGame, htmlPopupCountdown];

    getGamemodes();

    listenToPopupsClose();
}

const initGamepage = function() {
    htmlPopups = [htmlPopupEnd];

    client.connect({onSuccess:listenToMQTTConnect});

    listenToPopupsClose();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM LOAD COMPLETE")

    htmlStartpage = document.querySelector('js-startpage');
    htmlGamepage = document.querySelector('js-gamepage');

    /* Startpage elements */
    htmlGamemodeList = document.querySelector('.js-gamemodes');
    htmlGameTitle = document.querySelector('.js-game-title');
    htmlGameDesc = document.querySelector('.js-game-desc');
    htmlGameStart = document.querySelector('.js-game-start');
    htmlScoreboard = document.querySelector('js-scoreboard');
    htmlPopupGame = document.querySelector('.js-popup-game');
    htmlPopupCountdown = document.querySelector('.js-popup-countdown');

    /* Gamepage elements */
    htmlCardsholder = document.querySelector('.js-cards-holder');
    htmlGameStop = document.querySelector('.js-game-stop');
    htmlPopupEnd = document.querySelector('.js-popup-end');

    getCurrentGame();
});
//#endregion
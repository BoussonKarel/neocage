const URL = `https://neocage.azurewebsites.net/api`;

let currentGame = {};


function convertSeconds(seconds) {
    time = Number(seconds);
    var m = Math.floor(time % 3600 / 60);
    var s = Math.floor(time % 3600 % 60);

    var mDisplay = m > 9 ? m : `${0}${m}`;
    var sDisplay = s > 9 ? s : `${0}${s}`;
    
    return `${mDisplay}:${sDisplay}`;
};



//MQTT Client
client = new Paho.MQTT.Client("13.81.105.139", 80, "")


//#region ***  DOM references ***

//#endregion


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

    let gamemodeList = document.querySelector('.js-gamemodes')


    data.forEach((gamemode) => {
    
        let description, duration, id, name, released;

        description = gamemode.description;
        duration = gamemode.duration;
        id = gamemode.id;
        name = gamemode.name;
        released = gamemode.released;

        gamemodeList.innerHTML += `<li class="c-gamemode js-gamemode">${name}</li>`;

       
   
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
    let title, rules;

    console.log(`Gamemode : ${gamemode}`)

    title = document.querySelector('.js-gametitle');
    rules = document.querySelector('.js-gamerules');


    title.innerHTML = gamemode.name;
    rules.innerHTML = gamemode.description;

    
    //Speluitleg tonen
    

    getHighscores(gamemode.id);
          

    // de Game starten
};


const showHighscores = (data) => {

    let scoreboard = document.querySelector('.js-scoreboard')
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

    scoreboard.innerHTML += htmlString;


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


const handleCurrentgameRequest = (data) => {
    console.log(data);
    currentGame = data;

};

    
const handleButtons = () => {

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

    handleData(`${URL}/games/current`,handleCurrentgameRequest, errorCurrentGame );
    

};

const getHighscores = (gamemodeId) => {

    handleData(`${URL}/games/${gamemodeId}`,showHighscores, errorHighscores );

};

    //#endregion
    
    //#region ***  INIT / DOMContentLoaded  ***

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM LOAD COMPLETE")


    if(document.querySelector('.js-app')) {
        getGamemodes();
        console.log("We bevinden ons in de app view");
    } else if(document.querySelector('.js-game')){
        console.log("We bevinden ons in de game view");
        client.connect({onSuccess:listenToMQTTConnect});
        
    };

    
});
    //#endregion


const URL = `https://neocage.azurewebsites.net/api`;

let currentGame = {};



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


    data.forEach((gamemode) => {
    
        let description, duration, id, name, released;

        description = gamemode.description;
        duration = gamemode.duration;
        id = gamemode.id;
        name = gamemode.name;
        released = gamemode.released;
    // console.log(gamemode);
    
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
    //Naam van de gamemode tonen

    
    //Speluitleg tonen
    

    getHighscores(gamemode.id);
        

    

    // de Game starten
};


const showHighscores = (data) => {

    data.forEach((highscore) => {
        let username, score, id;
        
        username = highscore.username;
        score = highscore.score;
        id = highscore.id;

        console.log(score, username)
    });


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
        console.log('De game is gestopt')

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
            
    client.connect({onSuccess:listenToMQTTConnect});
            
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
    getGamemodes();
});
    //#endregion


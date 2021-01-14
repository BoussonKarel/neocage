using NCFunctions.Models;
using NCFunctions.Repositories;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace NCFunctions.Helpers
{
    public static class GameHelper
    {
        public static async Task<Game> StartGame(Gamemode gamemode)
        {
            try
            {
                // Haal de huidige game op
                Game CurrentGame = await GameRepository.GetCurrentGameAsync();

                // Is er al een game?
                if (CurrentGame == null)
                {
                    DateTime now = DateTime.Now;
                    // Er is nog geen game bezig, game aanmaken
                    CurrentGame = new Game()
                    {
                        Id = Guid.NewGuid(),
                        GamemodeId = gamemode.Id,
                        TimeStarted = now,
                        Duration = gamemode.Duration,
                        Score = 0
                    };

                    // Game details naar device sturen in start methode
                    await IoTHubHelper.StartGameMethod(CurrentGame);

                    return CurrentGame;
                }
                else
                {
                    // Er is al een game bezig
                    throw new ApplicationException("GAME_BUSY");
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static async Task StopGame()
        {
            try
            {
                Game CurrentGame = await GameRepository.GetCurrentGameAsync();

                if (CurrentGame == null)
                {
                    // Er is geen game bezig
                    throw new ApplicationException("NO_GAME");
                }
                else
                {
                    // Er is al een game bezig, stuur stop methode
                    await IoTHubHelper.StopGameMethod();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static void GameUpdated(Game game)
        {
            try
            {
                // Received a game update, send it to the end user

                // type "game_update", payload is the game info
                string gamePayload = JsonConvert.SerializeObject(game);
                MqttMessage message = new MqttMessage("game_update", gamePayload);

                // Serialize
                string mqttBody = JsonConvert.SerializeObject(message);

                // Send to topic /neocage
                MqttHelper.SendMessage("/neocage", mqttBody);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static async Task GameEnded(Game game)
        {
            try
            {
                // Received a game update, the game has ended, send it to the end user

                // type "game_end", payload is the game info
                string gamePayload = JsonConvert.SerializeObject(game);
                MqttMessage message = new MqttMessage("game_end", gamePayload);

                // Serialize
                string mqttBody = JsonConvert.SerializeObject(message);

                // Send to topic /neocage
                MqttHelper.SendMessage("/neocage", mqttBody);

                // Save game to table storage
                await GameRepository.SaveGameAsync(game);
            }
            catch (Exception ex) {
                throw ex;
            }
        }
    }
}

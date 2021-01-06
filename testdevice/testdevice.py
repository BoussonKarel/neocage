import os
import json
import time
import random
from azure.iot.device import IoTHubDeviceClient, MethodResponse

current_game = dict()

conn_str = "HostName=IoTNeoCage.azure-devices.net;DeviceId=testdevice;SharedAccessKey=xmO8wWsMDV0YU3To/n4C+Eua+eSyJjHwvcC19aNOpsQ="
# Create instance of the device client using the authentication provider
device_client = IoTHubDeviceClient.create_from_connection_string(conn_str)

def method_request_handler(method_request):
    global current_game
    
    # Determine how to respond to the method request based on the method name
    if method_request.name == "currentgame":
        print("Backend asks for current game:")

        if (current_game):
            print("-- There is a game: ", str(current_game))
            # Game bezig
            payload = current_game # Set response payload
            status = 200 # return status code
        else:
            print("-- There is no game: ", str(current_game))
            # Geen game bezig
            payload = {"id": None} # Set response payload
            status = 404 # return status code

    elif method_request.name == "startgame":
        print("Received start game event:")
        print(method_request.payload)

        current_game = method_request.payload
        print("New game: ", current_game["gamemode"])

        payload = {"started": True} # Set response payload
        status = 200 # return status code
    elif method_request.name == "stopgame":
        print("Received stop game event")

        current_game = None

        payload = {"stopped": True} # Set response payload
        status = 200 # return status code
    else:
        payload = {"error": "unknown method"} # Set response payload
        status = 400 # return status code
        print("Executed unknown method: " + method_request.name)

    # Send the response
    method_response = MethodResponse.create_from_method_request(method_request, status, payload)
    device_client.send_method_response(method_response)

def twin_patch_handler(patch):
    pass
    # patch = alle desired properties
    # global threshold
    # threshold = patch["threshold"]
    # print(f"Threshold update: {threshold}")

def testmenu():
    global current_game
    print("Maak een keuze: ")
    print("1) Stuur score update")
    print("2) Stop game")
    keuze = int(input("> "))
    if (keuze == 1):
        if (current_game):
            # Score += 1
            current_game["score"] += 1
            print("Score +1, nu is de score " + str(current_game["score"]))
            print("Dit verzenden naar Cloud / Backend...")

            # Save in IoTMessage format
            data = dict()
            data["type"] = "game_update"
            data["payload"] = json.dumps(current_game)

            # Send game update
            send_data(data)
        else:
            print("GEEN GAME BEZIG")
    if (keuze == 2):
        # END GAME
        if (current_game):
            current_game = None

            print("Game is gestopt")
            print("Dit verzenden naar Cloud / Backend...")

            # Save in IoTMessage format
            data = dict()
            data["type"] = "game_end"
            data["payload"] = json.dumps(current_game)
            
            # Send game update
            send_data(data)
        else:
            print("GEEN GAME BEZIG")

def send_data(data):
    # data = {"device": "pckarel", "temperature": temperatuur} # python dict
    body = json.dumps(data) # json string

    #versturen
    device_client.send_message(body)

def main():
    global device_client
    # global threshold

    while True:
        # iets sturen?
        testmenu()
        
    # finally, disconnect
    device_client.disconnect()


if __name__ == "__main__":
    current_game = None
    device_client.connect()

    twin = device_client.get_twin()
    # property = twin["desired"]["property"]

    device_client.on_twin_desired_properties_patch_received = twin_patch_handler

    device_client.on_method_request_received = method_request_handler

    # reported_properties = { "bootstatus": "HALLO WERELD" }
    # device_client.patch_twin_reported_properties(reported_properties)

    main()
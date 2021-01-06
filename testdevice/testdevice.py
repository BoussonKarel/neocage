import os
import json
import time
import random
from azure.iot.device import IoTHubDeviceClient, MethodResponse

conn_str = "HostName=IoTNeoCage.azure-devices.net;DeviceId=testdevice;SharedAccessKey=xmO8wWsMDV0YU3To/n4C+Eua+eSyJjHwvcC19aNOpsQ="
# Create instance of the device client using the authentication provider
device_client = IoTHubDeviceClient.create_from_connection_string(conn_str)

def method_request_handler(method_request):
    # Determine how to respond to the method request based on the method name
    if method_request.name == "startgame":
        print("Received start game event:")
        print(method_request.payload)

        payload = {"started": True} # Set response payload
        status = 200 # return status code
    elif method_request.name == "stopgame":
        print("Received stop game event")

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

def main():
    global device_client
    # global threshold

    while True:
        # iets sturen?
        
        time.sleep(3) #even wachten
        
    # finally, disconnect
    device_client.disconnect()


if __name__ == "__main__":
    device_client.connect()

    twin = device_client.get_twin()
    # property = twin["desired"]["property"]

    device_client.on_twin_desired_properties_patch_received = twin_patch_handler

    device_client.on_method_request_received = method_request_handler

    # reported_properties = { "bootstatus": "HALLO WERELD" }
    # device_client.patch_twin_reported_properties(reported_properties)

    main()
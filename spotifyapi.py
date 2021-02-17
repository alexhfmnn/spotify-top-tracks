# -*- coding: utf-8 -*-
"""
Created on Fri Feb 12 10:20:15 2021

@author: Alex
"""

import json
import os
import requests

json_path = "./spotify-credentials.json"
spotifyCredentials = ""



def loadTopArtistsAndSongs(spec, time_range="short_term", limit=10):
    global spotifyCredentials
    if spec not in ["artists", "tracks"] and time_range not in ["short_term", "medium_term", "long_term"]:
        return None
    url = "https://api.spotify.com/v1/me/top/" + spec + "?time_range=" + time_range + "&limit=" + str(limit)
    headers = { "Authorization": "Bearer " + spotifyCredentials['accessToken'], "Content-Type": "application/json" } 
    req = requests.get(url, headers=headers)
    if (req.status_code == 401):
        print("Error 401 - Generating new AccessToken")
        success = refreshSpotifyAccessToken()
        if (success):
            print("Generation successful.")
            return loadTopArtistsAndSongs(spec)
        else:
            return None
    return json.loads(req.content)["items"]
        
        

def loadSpotifyCredentials():
    global spotifyCredentials
    global json_path
    if os.path.exists(json_path):
        file = open(json_path)
        spotifyCredentials = json.load(file)
        return spotifyCredentials
    return None


def refreshSpotifyAccessToken():
    global spotifyCredentials
    if (spotifyCredentials != None):
        url = "https://accounts.spotify.com/api/token"
        headers = { "Content-Type": "application/x-www-form-urlencoded" }
        body = "grant_type=refresh_token&refresh_token=" + spotifyCredentials['refreshToken'] + "&client_id=" + spotifyCredentials['clientId'] + "&client_secret=" + spotifyCredentials['clientSecret']
        req = requests.post(url, data=body, headers=headers)
        acc_token = json.loads(req.content)['access_token']
        # Replace Access Token in JSON file
        global json_path
        with open(json_path, 'r') as file:
            json_data = json.load(file)
            json_data['accessToken'] = acc_token
        with open(json_path, 'w') as file:
            json.dump(json_data, file)
            spotifyCredentials ['accessToken'] = acc_token
        return True
    return False


def filterJSON(json_data, spec):
    if (spec == "tracks") and (len(json_data) > 0):
        toptracks = []
        for i in range(0,len(json_data)):
            song_title = json_data[i]["name"]
            artist = json_data[i]["artists"][0]["name"]
            cover_art = json_data[i]["album"]["images"][0]["url"]
            songURL = json_data[i]["external_urls"]["spotify"]
            toptracks.append((song_title, artist, cover_art, songURL))
        return toptracks
    return None
    
    
        


spec = "tracks"
loadSpotifyCredentials()
res = loadTopArtistsAndSongs(spec)
filtered = filterJSON(res, spec)
with open("./spotify.json", 'w') as output:
    json.dump(filtered, output)

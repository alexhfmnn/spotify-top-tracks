# spotify-top-tracks

Based on: https://gist.github.com/marco79cgn/79a6a265d978dc22cc2a12058b24e02b

Widget for iOS 14 showing your most listened to tracks within the past four weeks.

### Installation
#### Spotify prerequisites
*Instructions from [Authorization Code Flow](https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow)* <br>
1.) Go to [Spotify Developer API](https://developer.spotify.com/dashboard/login) and create a new Application <br>
2.) Hit "Edit Settings" and add *https://spotify.com* as Redirect URI <br>
3.) Store *Client ID* and *Client Secret* in an Editor <br>
4.) Open a new incognito browser tab: https://accounts.spotify.com/authorize?client_id=YOURCLIENTID&response_type=code&redirect_uri=https%3A%2F%2Fspotify.com&scope=user-top-read (**Make sure to replace YOURCLIENTID**) <br>
5.) Click "Accept" <br>
6.) You will be redirected to something like https://www.spotify.com/de/?code=AQD4q4v6Klt9ZW5VtTbnbHAWDLKK8y1t6Ammov..... <br>
7.) Store this *code* once again in an Editor <br>
8.) (Base64 Encode)[https://www.base64encode.org/] "<client_id>:<client_secret>" <br>
9.) `curl -H "Authorization: Basic ZjM...zE=" -d grant_type=authorization_code -d code=MQCbtKe...44KN -d redirect_uri=https%3A%2F%2Fspotify.com https://accounts.spotify.com/api/token > spotify_access_token.json`, where ZjM...zE= is the Base64 encoded string from Step 8 and MQCbtKe...44KN the code from step 7 <br>
10.) You'll receive an access and a refresh token <br>
11.) Create a new File called *spotify-credentials.json* using all your collected data:
```json
{
  "clientSecret": "YOURCLIENTSECRET",
  "clientId": "YOURCLIENTID",
  "accessToken": "ACCESS TOKEN FROM STEP 10",
  "refreshToken": "REFRESH TOKEN FROM STEP 10"
}
```
12.) Store this JSON File in your iCloud Drive under *Scriptable/spotify-credentials.json*

#### iDevice prerequisites
- Make sure to have iOS 14 installed
- Download [Scriptable App](https://apps.apple.com/de/app/scriptable/id1405459188)
- Copy [the code from this repo](https://raw.githubusercontent.com/alexhfmnn/spotify-top-tracks/main/spotify-top-tracks.js) into the clipboard
- Paste it in a new Scriptable script
- Create a new Scriptable widget, choose a layout (*last one recommended*)
- Under Parameters select how many tracks will be shown (max is 10) and select the period ([1-10],["short", "medium", "long"])

<img src="https://user-images.githubusercontent.com/45359966/108242260-0083f300-714d-11eb-9a57-6354a737cca4.PNG" width="200" /> | <img src="https://user-images.githubusercontent.com/45359966/108352883-c287dd00-71e7-11eb-8ccd-8ac0ee9637eb.PNG" width="200" />


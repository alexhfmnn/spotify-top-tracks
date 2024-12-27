# spotify-top-tracks

Based on: https://gist.github.com/marco79cgn/79a6a265d978dc22cc2a12058b24e02b

Widget for iOS 18 showing your most listened to tracks within the past four weeks.

### Installation
#### Spotify prerequisites
*Instructions from [Authorization Code Flow](https://developer.spotify.com/documentation/web-api/concepts/authorization#authorization-code-flow)* <br>
1.) Go to [Spotify Developer API](https://developer.spotify.com/dashboard/login) and create a new Application <br>
2.) Click "Edit Settings" and add *https://spotify.com* as Redirect URI <br>
3.) Open a Bash and set *Client ID* and *Client Secret* as environment variables
```bash
export CLIENT_ID=1234567890 # EDIT && \
export CLIENT_SECRET=mfq837wfgw8wvcg673gnfm # EDIT && \
export REDIRECT_URI=https%3A%2F%2Fspotify.com && \
export BEARER=$(echo -n "${CLIENT_ID}:${CLIENT_SECRET}" | base64)
```
4.) Open a new incognito browser tab: [https://accounts.spotify.com/authorize?client_id=\<YOURCLIENTID\>&response_type=code&redirect_uri=https%3A%2F%2Fspotify.com&scope=user-top-read](https://accounts.spotify.com/authorize?client_id=<YOURCLIENTID>&response_type=code&redirect_uri=https%3A%2F%2Fspotify.com&scope=user-top-read) (**Make sure to replace \<YOURCLIENTID\> within the URL**) <br>
5.) Click "Accept" <br>
6.) You will be redirected to something like [https://www.spotify.com/de/?code=AQD4q4v6Klt9ZW5VtTbnbHAWDLKK8y1t6Ammov.....](https://www.spotify.com/de/?code=AQD4q4v6Klt9ZW5VtTbnbHAWDLKK8y1t6Ammov.....) <br>
7.) Store this *code* once again in an environment variable <br>
```bash
export RETURN_CODE=AQD4q4v6Klt9ZW5VtTbnbHAWDLKK8y1t6Ammov.....
```
8.) Run the below command without any modifications
```bash
curl -H "Authorization: Basic ${BEARER}" -d grant_type=authorization_code -d code=${RETURN_CODE} -d redirect_uri=${REDIRECT_URI} https://accounts.spotify.com/api/token > spotify_access_token.json && \
cat spotify_access_token.json
```
9.) You'll receive an access and a refresh token <br>
10.) Create a new File called *spotify-credentials.json* using all your collected data:
```json
{
  "clientSecret": "YOURCLIENTSECRET",
  "clientId": "YOURCLIENTID",
  "accessToken": "ACCESS TOKEN FROM STEP 8",
  "refreshToken": "REFRESH TOKEN FROM STEP 8"
}
```
11.) Store this JSON File in your iCloud Drive under *Scriptable/spotify-credentials.json*

#### iDevice prerequisites
- Make sure to have iOS 18 installed
- Download [Scriptable App](https://apps.apple.com/de/app/scriptable/id1405459188)
- Copy [the code from this repo](https://raw.githubusercontent.com/alexhfmnn/spotify-top-tracks/main/spotify-top-tracks.js) into the clipboard
- Paste it in a new Scriptable script
- Create a new Scriptable widget, choose a layout (*last one recommended*)
- Under Parameters select how many tracks will be shown (max is 10) and select the period ([1-10],["short", "medium", "long"])

<img src="https://user-images.githubusercontent.com/45359966/108242260-0083f300-714d-11eb-9a57-6354a737cca4.PNG" width="200" /> | <img src="https://user-images.githubusercontent.com/45359966/108352883-c287dd00-71e7-11eb-8ccd-8ac0ee9637eb.PNG" width="200" />


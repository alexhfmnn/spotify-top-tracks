let spotifyCredentials
let widget = await createWidget()
Script.setWidget(widget)
Script.complete()

async function createWidget() {

    let args = await getWidgetArgs()
    // let args_amount = args["amount"]
    let args_amount = args
    // let args_period = args["period"]

    let widget = new ListWidget()
    let spotifyIcon = await getImage("spotify-icon.png")
    let startcolor = new Color("3c3c3c")
    let endcolor = new Color("111111")
    let gradient = new LinearGradient()
    gradient.colors = [startcolor,endcolor]
    gradient.locations = [0.0,1]
    widget.backgroundGradient = gradient
    // widget.backgroundColor = new Color("1e2040")
    
    // load spotify credentials from iCloud Drive
    spotifyCredentials = await loadSpotifyCredentials()
    if(spotifyCredentials != null) {
      widget.url = "spotify://"
      let topTracks = await loadTopTracks(args_amount)
      if(topTracks != null) {
        let titles = []
        let artists = []
        let coverURLs = []
        let songURLs = []
        for (i in topTracks) {
          titles.push(topTracks[i]["name"])
          artists.push(topTracks[i]["artists"][0]["name"])
          coverURLs.push(topTracks[i]["album"]["images"][0]["url"])
          songURLs.push(topTracks[i]["external_urls"]["spotify"])
        }
        widget.setPadding(20, 20, 8, 8)

        let titleStack = widget.addStack()
        titleStack.layoutVertically()
        titleStack.topAlignContent()

        // header
        let header = titleStack.addStack()
        let widgettitle = header.addText("Spotify Top Tracks")
        widgettitle.font = Font.mediumSystemFont(12)
        widgettitle.textColor = Color.white()
        widgettitle.leftAlignText()
        // header.addSpacer()
        // let spotifyImage = header.addImage(spotifyIcon)
        // spotifyImage.imageSize = new Size(15,15)
        // spotifyImage.rightAlignImage()
        titleStack.addSpacer(20)


        let row = widget.addStack()
        row.layoutVertically()

        for (i=0; i < args_amount; i++) {
          let stack = row.addStack()
          stack.layoutHorizontally()
          stack.url = songURLs[i]
          let placement = parseInt(i)+1
          let placementtxt = stack.addText(placement.toString())
          placementtxt.font = Font.semiboldRoundedSystemFont(16)
          placementtxt.textColor = Color.white()
          stack.addSpacer(20)
          let coverUrl = coverURLs[i]
          let coverImage = await loadImage(coverUrl)
          let cover = stack.addImage(coverImage)
          cover.cornerRadius = 3
          stack.addSpacer(10)
          let stext = stack.addText(artists[i] + " - " + titles[i])
          stext.font = Font.semiboldRoundedSystemFont(16)
          stext.textColor = Color.white()
          row.addSpacer(5)
        }
        
      }
    } else {
      // no credentials found
      let spotifyImage = widget.addImage(spotifyIcon)
      spotifyImage.imageSize = new Size(25,25)
      spotifyImage.rightAlignImage()
      widget.addSpacer(10)
      console.log("Could not find Spotify credentials!")
      let ts = widget.addText("Couldn't find your spotify credentials in iCloud Drive. \n\n Please tap me for setup instructions.")
      ts.textColor = Color.white()
      ts.font = Font.boldSystemFont(11)
      ts.leftAlignText()
      widget.url = "https://github.com/alexhfmnn/spotify-top-tracks/blob/main/README.md"
    }

    return widget
}

// get TopTracks via Spotify Web API
async function loadTopTracks(query_amount) {
	const req = new Request("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=" + query_amount)
	req.headers = { "Authorization": "Bearer " + spotifyCredentials.accessToken, "Content-Type": "application/json" }
	let npResult = await req.load()
	    if (req.response.statusCode == 401) {
      // access token expired, trying to refresh
      let success = await refreshSpotifyAccessToken()
      if(success) {
        return await loadTopTracks(query_amount)
      } else {
        return null
      }
    } else if (req.response.statusCode == 200) {
      npResult = JSON.parse(npResult.toRawString()) 
    }
    return npResult["items"]
}

// load and validate spotify credentials from iCloud Drive
async function loadSpotifyCredentials() {
    let fm = FileManager.iCloud()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, "spotify-credentials.json")
    let spotifyCredentials
    if(fm.fileExists(path)) {
      await fm.downloadFileFromiCloud(path)
      let spotifyCredentialsFile = Data.fromFile(path)
      spotifyCredentials = JSON.parse(spotifyCredentialsFile.toRawString())
      if (isNotEmpty(spotifyCredentials.clientId) 
        && isNotEmpty(spotifyCredentials.clientSecret) 
          && isNotEmpty(spotifyCredentials.accessToken) 
            && isNotEmpty(spotifyCredentials.refreshToken)) {
              return spotifyCredentials
      }
    }
    return null
}

// helper function to check not empty strings
function isNotEmpty(stringToCheck) {
  if (stringToCheck != null && stringToCheck.length > 0) {
    return true
  } else {
    return false
  }
}

// The Spotify access token expired so we get a new one by using the refresh token (Authorization Flow)
async function refreshSpotifyAccessToken() {
  if(spotifyCredentials != null) {
    let req = new Request("https://accounts.spotify.com/api/token")
    req.method = "POST"
    req.headers = { "Content-Type": "application/x-www-form-urlencoded" }
    req.body = "grant_type=refresh_token&refresh_token=" + spotifyCredentials.refreshToken + "&client_id=" + spotifyCredentials.clientId + "&client_secret=" + spotifyCredentials.clientSecret
    let result = await req.loadJSON()
    spotifyCredentials.accessToken = result.access_token
    let fm = FileManager.iCloud()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, "spotify-credentials.json")
    fm.write(path, Data.fromString(JSON.stringify(spotifyCredentials)))
    return true
  }
  return false
  
}

// get images from local filestore or download them once
async function getImage(image) {
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, image)
  if(fm.fileExists(path)) {
    return fm.readImage(path)
  } else {
    // download once
    let imageUrl
    switch (image) {
      case 'spotify-icon.png':
        imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/240px-Spotify_logo_without_text.svg.png"
        break
      default:
        console.log(`Sorry, couldn't find ${image}.`);
    }
    let iconImage = await loadImage(imageUrl)
    fm.writeImage(path, iconImage)
    return iconImage
  }
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}

async function getWidgetArgs() {
  let default_val = 10
  if (isNotEmpty(args.widgetParameter)) {
    let params = parseInt(args.widgetParameter)
    console.log(params)
    if (params <= 10) {
      return params
    }
    else {
      return default_val
    }
  }
  else {
    console.log("no widget args set")
    return default_val
  }
}
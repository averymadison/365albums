const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const bandcamp = require("bandcamp-scraper");
const spotifyWebApi = require("spotify-web-api-node");

const spotify = new spotifyWebApi({
  clientId: functions.config().spotify.id,
  clientSecret: functions.config().spotify.secret
});

spotify.clientCredentialsGrant().then(
  function(data: any) {
    console.log("The access token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"]);

    // Save the access token so that it's used in future calls
    spotify.setAccessToken(data.body["access_token"]);
  },
  function(err: any) {
    console.log("Something went wrong when retrieving an access token", err);
  }
);

exports.getBandcampAlbumInfo = functions.https.onRequest(
  (req: any, res: any) => {
    const albumUrl = req.query.albumUrl;

    cors(req, res, () => {
      bandcamp.getAlbumInfo(albumUrl, function(error: any, albumInfo: any) {
        if (error) {
          return res.send(error);
        } else {
          return res.send(albumInfo);
        }
      });
    });
  }
);

exports.search = functions.https.onRequest((req: any, res: any) => {
  const type = req.query.type;
  const query = req.query.q;

  cors(req, res, () => {
    if (type === "spotify") {
      spotify.searchTracks(query).then(
        function(data: any) {
          return res.send(data.body);
        },
        function(err: any) {
          return res.send(err);
        }
      );
    }

    if (type === "bandcamp") {
      bandcamp.search({ query, page: 1 }, function(
        error: any,
        searchResults: any
      ) {
        if (error) {
          return res.send(error);
        } else {
          return res.send(searchResults);
        }
      });
    }
  });
});

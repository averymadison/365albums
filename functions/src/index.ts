const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const bandcamp = require("bandcamp-scraper");
const spotifyWebApi = require("spotify-web-api-node");

const spotify = new spotifyWebApi({
  clientId: functions.config().spotify.id,
  clientSecret: functions.config().spotify.secret
});

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

exports.searchBandcamp = functions.https.onRequest((req: any, res: any) => {
  const params = {
    query: req.query.q,
    page: 1
  };

  cors(req, res, () => {
    bandcamp.search(params, function(error: any, searchResults: any) {
      if (error) {
        return res.send(error);
      } else {
        return res.send(searchResults);
      }
    });
  });
});

exports.searchSpotify = functions.https.onRequest((req: any, res: any) => {
  const query = req.query.q;

  cors(req, res, () => {
    spotify.searchTracks(query).then(
      function(data: any) {
        console.log("Albums information", data.body);
      },
      function(err: any) {
        console.error(err);
      }
    );
  });
});

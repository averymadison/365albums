const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const bandcamp = require("bandcamp-scraper");
const vibrant = require("node-vibrant");

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

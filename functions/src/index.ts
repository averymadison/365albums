/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from 'firebase-functions';
const cors = require('cors')({ origin: true });
const bandcamp = require('bandcamp-scraper');
import spotifyWebApi from 'spotify-web-api-node';
const discogsWebApi = require('disconnect').Client;

const spotify = new spotifyWebApi({
  clientId: functions.config().spotify.id,
  clientSecret: functions.config().spotify.secret
});

const discogs = new discogsWebApi({
  consumerKey: functions.config().discogs.key,
  consumerSecret: functions.config().discogs.secret
}).database();

spotify
  .clientCredentialsGrant()
  .then(data => {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotify.setAccessToken(data.body['access_token']);
  })
  .catch(err => {
    console.log('Something went wrong when retrieving an access token', err);
  });

exports.search = functions.https.onRequest((req: any, res: any) => {
  const type = req.query.type;
  const query = req.query.q;

  cors(req, res, () => {
    switch (type) {
      case 'spotify':
        spotify
          .searchAlbums(query)
          .then(
            function(data: any) {
              return res.send(
                data.body.albums.items.filter(
                  (item: any) => item.album_type === ('album' || 'compilation')
                )
              );
            },
            function(err: any) {
              return res.send(err);
            }
          )
          .catch((rejected: any) => {
            console.log(rejected);
          });
        break;

      case 'bandcamp':
        bandcamp.search({ query, page: 1 }, function(
          error: any,
          searchResults: any
        ) {
          if (error) {
            return res.send(error);
          } else {
            return res.send(
              searchResults.filter((item: any) => item.type === 'album')
            );
          }
        });
        break;

      case 'discogs':
        discogs.search(
          query,
          { type: 'master' },
          (error: any, results: any) => {
            if (error) {
              return res.send(error);
            } else {
              return res.send(results.results);
            }
          }
        );
    }
  });
});

// Pass in an ID for a master release
exports.getDiscogsFullInfo = functions.https.onRequest((req: any, res: any) => {
  const id = req.query.id;

  discogs.getMaster(id, (error: any, results: any) => {
    if (error) {
      return res.send(error);
    } else {
      console.log('Title: ' + results.title);
      console.log(
        'Artists: ' +
          results.artists.map((artist: any) => artist.name).join(', ')
      );
      console.log('Number of Tracks: ' + results.trackList.length());
      console.log('Lowres image: ' + results.images[0].uri150);
      console.log('Hires image: ' + results.images[0].uri);
      console.log('Release date: ' + results.year);
      return res.send(results);
    }
  });
});

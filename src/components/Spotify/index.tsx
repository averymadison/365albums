import SpotifyWebApi from 'spotify-web-api-js';
import request from 'request';

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const Spotify = () => {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64')
    },
    form: {
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // Use the access token to access the Spotify Web API
      const token = body.access_token;
      const options = {
        url: 'https://api.spotify.com/v1/users/jmperezperez',
        headers: {
          Authorization: 'Bearer ' + token
        },
        json: true
      };
      const Spotify = new SpotifyWebApi();
      Spotify.setAccessToken('token');

      request.get(options, function(error, response, body) {
        console.log(body);
      });
    }
  });
};

export default Spotify;

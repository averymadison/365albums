import React from 'react';
import { compose } from 'recompose';
import {
  withEmailVerification,
  withPermissions,
  AuthUserContext
} from '../../components/Session';
import Firebase, { withFirebase } from '../../components/Firebase';

const Home = () => (
  <div>
    <h1>Home</h1>
    <p>You are signed in!</p>

    <Albums />
  </div>
);

interface Album {
  date: Date;
  source: 'spotify' | 'bandcamp';
  uri: string;
}

interface Props {
  firebase: Firebase;
}

interface State {
  loading: boolean;
  albums?: Album[] | null;
  newAlbumUri?: string;
  // newAlbumDate: Date;
}

class AlbumsBase extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      albums: [],
      newAlbumUri: ''
      // newAlbumDate: new Date()
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.albums().on('value', snapshot => {
      const albumsObject = snapshot.val();

      if (albumsObject) {
        const albumList = Object.keys(albumsObject).map(key => ({
          ...albumsObject[key],
          uid: key
        }));

        this.setState({ albums: albumList, loading: false });
      } else {
        this.setState({ albums: null, loading: false });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.albums().off();
  }

  onChangeAlbumUri = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newAlbumUri: event.target.value });
  };

  // onChangeAlbumDate = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   this.setState({ newAlbumDate: new Date(event.target.value) });
  // };

  onCreateAlbum = (event: any, authUser: any) => {
    this.props.firebase.albums().push({
      uri: this.state.newAlbumUri,
      // date: this.state.newAlbumDate,
      userId: authUser.uid
    });

    this.setState({ newAlbumUri: '' });

    event.preventDefault();
  };

  render() {
    const { albums, loading, newAlbumUri } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {loading && <div>Loading...</div>}
            {albums ? (
              <AlbumList albums={albums} />
            ) : (
              <div>There are no albums.</div>
            )}

            <form onSubmit={event => this.onCreateAlbum(event, authUser)}>
              {/* <select>
                <option>Spotify</option>
                <option>Bandcamp</option>
              </select> */}
              {/* <input
                type="date"
                value={newAlbumDate.toString()}
                onChange={this.onChangeAlbumDate}
              /> */}
              <input
                type="text"
                value={newAlbumUri}
                onChange={this.onChangeAlbumUri}
              />
              <button type="submit">Add</button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const AlbumList = ({ albums }: any) => (
  <ul>
    {albums.map((album: Album) => (
      <li key={album.uri}>
        <strong>{album.uri}</strong>
      </li>
    ))}
  </ul>
);

const Albums = withFirebase(AlbumsBase);

const condition = (authUser: any) => !!authUser;

export default compose(withEmailVerification, withPermissions(condition))(Home);

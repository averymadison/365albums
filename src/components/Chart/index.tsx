import React from 'react';
import { AuthUserContext } from '../Session';
import Firebase, { withFirebase } from '../Firebase';
import Album from '../Album';

interface Props {
  firebase: Firebase;
  chartId: string;
}

interface State {
  isLoading: boolean;
  isEditing: boolean;
  error: any;
  title: string;
  albums: any;
  newAlbumUri: string;
  newAlbumSource: string;
}

const INITIAL_STATE = {
  isLoading: false,
  isEditing: false,
  error: '',
  title: '',
  albums: [],
  newAlbumUri: '',
  newAlbumSource: 'spotify'
};

class ChartBase extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...INITIAL_STATE
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    this.props.firebase.db
      .ref(`charts/${this.props.chartId}`)
      .on('value', snapshot => {
        const chart = snapshot.val();

        if (chart) {
          this.setState({
            isLoading: false,
            title: chart.title ? chart.title : '',
            albums: chart.albums ? chart.albums : {}
          });
        } else {
          this.setState({ ...INITIAL_STATE });
          this.setState({ error: "Couldn't locate chart." });
        }
      });
  }

  componentWillUnmount() {
    this.props.firebase.charts().off();
  }

  onCreateChart = (event: any, authUser: any) => {
    const newChartKey = this.props.firebase.charts().push({
      createdBy: authUser.uid,
      createdAt: this.props.firebase.serverValue.TIMESTAMP,
      updatedAt: this.props.firebase.serverValue.TIMESTAMP,
      owner: authUser.uid,
      title: '',
      albums: {}
    }).key;

    this.props.firebase.user(authUser.uid).update({
      primaryChart: newChartKey
    });

    event.preventDefault();
  };

  onToggleEditMode = () => {
    this.setState({ isEditing: !this.state.isEditing });
  };

  onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  onSaveTitle = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { chartId } = this.props;
    const { title } = this.state;

    this.props.firebase.db.ref(`charts/${chartId}`).update({ title });

    this.onToggleEditMode();
    event.preventDefault();
  };

  onCreateAlbum = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { chartId } = this.props;
    const { newAlbumSource, newAlbumUri } = this.state;

    this.props.firebase.db
      .ref(`charts/${chartId}/albums`)
      .push({ uri: newAlbumUri, source: newAlbumSource });

    this.setState({ newAlbumUri: '' });
    event.preventDefault();
  };

  render() {
    const { chartId } = this.props;
    const {
      error,
      title,
      albums,
      isLoading,
      isEditing,
      newAlbumUri,
      newAlbumSource
    } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {isLoading && <div>Loading...</div>}
            {chartId && !error ? (
              <React.Fragment>
                {!isEditing ? (
                  <React.Fragment>
                    <h2>{title ? title : 'Add a title...'}</h2>
                    <button type="button" onClick={this.onToggleEditMode}>
                      Edit
                    </button>
                  </React.Fragment>
                ) : (
                  <form onSubmit={this.onSaveTitle}>
                    <input
                      name="title"
                      type="text"
                      placeholder="title"
                      value={title}
                      onChange={this.onChange}
                    />
                    <button type="submit">Save</button>
                  </form>
                )}

                {Object.keys(albums).map(key => (
                  <Album
                    key={key}
                    uri={albums[key].uri}
                    source={albums[key].source}
                  />
                ))}

                <form onSubmit={this.onCreateAlbum}>
                  <select
                    name="newAlbumSource"
                    value={newAlbumSource}
                    onChange={this.onChange}
                  >
                    <option value="spotify">Spotify</option>
                    <option value="bandcamp">Bandcamp</option>
                  </select>
                  <input
                    name="newAlbumUri"
                    type="text"
                    placeholder="Album URI"
                    value={newAlbumUri}
                    onChange={this.onChange}
                  />
                  <button type="submit">Add album</button>
                </form>
              </React.Fragment>
            ) : (
              <div>
                {error && error}
                <form onSubmit={event => this.onCreateChart(event, authUser)}>
                  <button type="submit">Create a chart</button>
                </form>
              </div>
            )}
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const Chart = withFirebase(ChartBase);

export default Chart;

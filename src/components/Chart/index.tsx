import React from 'react';
import { format, isEqual, getWeekOfMonth } from 'date-fns';
import { AuthUserContext } from '../Session';
import Firebase, { withFirebase } from '../Firebase';
// import Album from '../Album';
import DayPicker from 'react-day-picker';
import './chart.css';

interface Props {
  firebase: Firebase;
  chartId: string;
}

interface State {
  isLoading: boolean;
  isEditing: boolean;
  error: any;
  title: string;
  updatedAt: string | null;
  albums: any;
  selectedDay: Date | null;
  newAlbumUri: string;
  newAlbumSource: string;
}

const INITIAL_STATE = {
  isLoading: false,
  isEditing: false,
  error: '',
  title: '',
  updatedAt: null,
  albums: {},
  selectedDay: null,
  newAlbumUri: '',
  newAlbumSource: 'spotify'
};

class ChartBase extends React.Component<Props, State> {
  private calendarRef = React.createRef<DayPicker>();

  constructor(props: Props) {
    super(props);

    this.state = {
      ...INITIAL_STATE
    };
  }

  componentDidMount() {
    const { firebase, chartId } = this.props;

    this.setState({ isLoading: true });

    firebase.chart(chartId).on('value', snapshot => {
      const chart = snapshot.val();

      if (chart) {
        this.setState({
          isLoading: false,
          title: chart.title ? chart.title : '',
          updatedAt: chart.updatedAt ? chart.updatedAt : null,
          albums: chart.albums ? chart.albums : {}
        });
        document.addEventListener('keydown', this.onKeyDown);
      } else {
        this.setState({ ...INITIAL_STATE });
        this.setState({ error: "Couldn't locate chart." });
      }
    });
  }

  componentWillUnmount() {
    const { firebase, chartId } = this.props;
    document.removeEventListener('keydown', this.onKeyDown);

    firebase.chart(chartId).off();
  }

  onCreateChart = (event: any, authUser: any) => {
    const { firebase } = this.props;

    const newChartKey = firebase.charts().push({
      createdBy: authUser.uid,
      createdAt: firebase.serverValue.TIMESTAMP,
      updatedAt: firebase.serverValue.TIMESTAMP,
      owner: authUser.uid,
      title: '',
      albums: {}
    }).key;

    firebase.user(authUser.uid).update({
      primaryChart: newChartKey
    });

    event.preventDefault();
  };

  onToggleEditMode = () => {
    const { isEditing } = this.state;
    this.setState({ isEditing: !isEditing });
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
    const { firebase, chartId } = this.props;
    const { title } = this.state;

    firebase
      .chart(chartId)
      .update({ title, updatedAt: firebase.serverValue.TIMESTAMP });

    this.onToggleEditMode();
    event.preventDefault();
  };

  onCreateAlbum = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { firebase, chartId } = this.props;
    const { selectedDay, newAlbumSource, newAlbumUri } = this.state;

    const dateAsString = format(selectedDay!, 'yyyy-MM-dd');

    firebase
      .chart(chartId)
      .child(`albums/${dateAsString}`)
      .update({ uri: newAlbumUri, source: newAlbumSource });

    firebase
      .chart(chartId)
      .update({ updatedAt: firebase.serverValue.TIMESTAMP });

    this.setState({ newAlbumUri: '' });
    event.preventDefault();
  };

  onDayClick = (day: Date) => {
    const { selectedDay } = this.state;
    isEqual(day, selectedDay!)
      ? this.setState({ selectedDay: null })
      : this.setState({ selectedDay: day });
  };

  onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      this.calendarRef.current!.showNextMonth();
    }

    if (event.key === 'ArrowLeft') {
      this.calendarRef.current!.showPreviousMonth();
    }
  };

  getAlbumInfoForDay = (day: Date) => {
    const { albums } = this.state;
    const dateAsString = format(day, 'yyyy-MM-dd');

    return albums[dateAsString];
  };

  renderChartHeader = () => {
    const { title, isEditing, updatedAt } = this.state;

    return (
      <div>
        {!isEditing ? (
          <React.Fragment>
            <strong>{title ? title : 'Add a title...'}</strong>
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
        <div>{updatedAt && `Updated ${updatedAt}`}</div>
      </div>
    );
  };

  renderDay = (day: Date) => {
    const { selectedDay } = this.state;

    return (
      <div className="dayContents">
        {selectedDay && isEqual(day, selectedDay) ? (
          format(selectedDay, 'd')
        ) : this.getAlbumInfoForDay(day) ? (
          <img src="http://placekitten.com/300/300" alt="A kitten" />
        ) : (
          '+'
        )}
      </div>
    );
  };

  renderAlbumDetails = () => {
    const { selectedDay, newAlbumSource, newAlbumUri } = this.state;

    const inlineGridRow = selectedDay && {
      gridRowStart: getWeekOfMonth(selectedDay) + 3
    };

    return selectedDay ? (
      <div
        className="expandedInfo"
        style={inlineGridRow ? inlineGridRow : undefined}
      >
        {this.getAlbumInfoForDay(selectedDay) ? (
          <React.Fragment>
            <img
              src="http://placekitten.com/300/300"
              alt="A kitten"
              className="albumImage"
            />
            <div>
              <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>
                {format(selectedDay, 'MMM d, yyyy')}
              </time>
              <h3>{this.getAlbumInfoForDay(selectedDay).source}</h3>
              <div>{this.getAlbumInfoForDay(selectedDay).uri}</div>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <form onSubmit={this.onCreateAlbum}>
              <div>Add an album for {format(selectedDay, 'MMM d')}</div>
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
        )}
      </div>
    ) : null;
  };

  render() {
    const { chartId } = this.props;
    const { selectedDay, error, isLoading } = this.state;

    return isLoading ? (
      <div>Loading...</div>
    ) : chartId && !error ? (
      <div>
        {this.renderChartHeader()}

        <div className="calendar">
          <DayPicker
            ref={this.calendarRef}
            onDayClick={this.onDayClick}
            selectedDays={selectedDay!}
            renderDay={this.renderDay}
          />
          {this.renderAlbumDetails()}
        </div>
      </div>
    ) : (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {error && error}
            <form onSubmit={event => this.onCreateChart(event, authUser)}>
              <button type="submit">Create a chart</button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const Chart = withFirebase(ChartBase);

export default Chart;

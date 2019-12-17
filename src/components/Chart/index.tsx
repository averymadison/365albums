import React from "react";
import classNames from "classnames";
import {
  format,
  isEqual,
  getWeekOfMonth,
  formatDistanceToNow,
  isPast
} from "date-fns";
import { AuthUserContext } from "../Session";
import Firebase, { withFirebase } from "../Firebase";
import DayPicker from "react-day-picker";
import "./chart.css";
import { FaSpotify, FaBandcamp } from "react-icons/fa";
import { FiEdit3, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { Palette } from "react-palette";
import { Link } from "react-router-dom";
import Album from "../Album";
const bandcamp = require("bandcamp-scraper");

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
  newAlbumTitle: string;
  newAlbumArtist: string;
  newAlbumYear: string;
  newAlbumArtworkUrl: string;
  newAlbumUri: string;
  newAlbumSource: string;
}

const INITIAL_STATE = {
  isLoading: false,
  isEditing: false,
  error: "",
  title: "",
  updatedAt: null,
  albums: {},
  selectedDay: new Date(),
  newAlbumTitle: "",
  newAlbumArtist: "",
  newAlbumYear: "",
  newAlbumArtworkUrl: "",
  newAlbumUri: "",
  newAlbumSource: "spotify"
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

    firebase.chart(chartId).on("value", snapshot => {
      const chart = snapshot.val();

      if (chart) {
        this.setState({
          isLoading: false,
          title: chart.title ? chart.title : "",
          updatedAt: chart.updatedAt ? chart.updatedAt : null,
          albums: chart.albums ? chart.albums : {}
        });
        document.addEventListener("keydown", this.onKeyDown);
      } else {
        this.setState({ ...INITIAL_STATE });
        this.setState({ error: "Couldn't locate chart." });
      }
    });
  }

  componentWillUnmount() {
    const { firebase, chartId } = this.props;
    document.removeEventListener("keydown", this.onKeyDown);

    firebase.chart(chartId).off();
  }

  onCreateChart = (event: any, authUser: any) => {
    const { firebase } = this.props;

    const newChartKey = firebase.charts().push({
      createdBy: authUser.uid,
      createdAt: firebase.serverValue.TIMESTAMP,
      updatedAt: firebase.serverValue.TIMESTAMP,
      owner: authUser.uid,
      title: "",
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
    const {
      selectedDay,
      newAlbumSource,
      newAlbumUri,
      newAlbumTitle,
      newAlbumArtist,
      newAlbumYear,
      newAlbumArtworkUrl
    } = this.state;

    const dateAsString = format(selectedDay!, "yyyy-MM-dd");

    try {
      firebase
        .chart(chartId)
        .child(`albums/${dateAsString}`)
        .update({
          uri: newAlbumUri,
          source: newAlbumSource,
          title: newAlbumTitle,
          artist: newAlbumArtist,
          year: newAlbumYear,
          artwork: newAlbumArtworkUrl
        });

      firebase
        .chart(chartId)
        .update({ updatedAt: firebase.serverValue.TIMESTAMP });

      this.setState({ newAlbumUri: "" });
      event.preventDefault();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  onMonthChange = () => {
    this.setState({ selectedDay: null });
  };

  onDayClick = (day: Date) => {
    const { selectedDay } = this.state;
    isEqual(day, selectedDay!)
      ? this.setState({ selectedDay: null })
      : this.setState({ selectedDay: day });
  };

  onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      this.calendarRef.current!.showNextMonth();
    }

    if (event.key === "ArrowLeft") {
      this.calendarRef.current!.showPreviousMonth();
    }
  };

  getAlbumInfoForDay = (day: Date) => {
    const { albums } = this.state;
    const dateAsString = format(day, "yyyy-MM-dd");

    return albums[dateAsString];
  };

  renderChartHeader = (props: any) => {
    const { chartId } = this.props;
    const { month, onPreviousClick, onNextClick } = props;

    const { title, isEditing, updatedAt } = this.state;

    const readableDate = formatDistanceToNow(new Date(updatedAt!));

    return (
      <header className="chart-header">
        {!isEditing ? (
          <React.Fragment>
            <h2 className="chart-title">{title ? title : "Add a title..."}</h2>
            <button type="button" onClick={this.onToggleEditMode}>
              <FiEdit3 />
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
              maxLength={32}
            />
            <button type="submit">Save</button>
          </form>
        )}
        <small>{updatedAt && `Last edited ${readableDate} ago`}</small>
        {format(month, "MMM YYY")}
        <Link to={`chart/${chartId}`}>Share</Link>
        <button onClick={() => onPreviousClick()}>
          <FiArrowLeft />
        </button>
        <button onClick={() => onNextClick()}>
          <FiArrowRight />
        </button>
      </header>
    );
  };

  renderDayDetails = (day: Date) => {
    return (
      <div className="dayDetails">
        {this.getAlbumInfoForDay(day) && (
          <div className="dayDetails__text">
            <div>{this.getAlbumInfoForDay(day).title}</div>
            <div>{this.getAlbumInfoForDay(day).artist}</div>
          </div>
        )}
        <time dateTime={format(day, "yyyy-MM-dd")} className="dateBadge">
          {format(day, "d")}
        </time>
      </div>
    );
  };

  renderDay = (day: Date) => {
    const classname = classNames("dayContents", {
      isPast: isPast(day.setHours(23, 59, 59))
    });

    return (
      <React.Fragment>
        <div className="selectedDate">
          <div className="selectedDate-contents">
            <div className="selectedDate-month">{format(day, "MMM")}</div>
            <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
            <div>
              {`${format(day, "DDD")} / 
              ${format(day.getFullYear(), "DDD")}`}
            </div>
          </div>
        </div>
        <Palette
          src={
            this.getAlbumInfoForDay(day) && this.getAlbumInfoForDay(day).artwork
          }
        >
          {({ data }) => (
            <div
              className="selectedDate-arrow"
              style={{ backgroundColor: data.lightVibrant }}
            ></div>
          )}
        </Palette>
        <div className={classname}>
          <Album
            src={
              this.getAlbumInfoForDay(day)
                ? this.getAlbumInfoForDay(day).artwork
                : null
            }
            alt={
              this.getAlbumInfoForDay(day) && this.getAlbumInfoForDay(day).title
            }
          />
          {this.renderDayDetails(day)}
        </div>
      </React.Fragment>
    );
  };

  renderCalendar = () => {
    const { selectedDay } = this.state;

    return (
      <div className="calendar">
        <DayPicker
          ref={this.calendarRef}
          captionElement={() => null}
          onMonthChange={this.onMonthChange}
          onDayClick={this.onDayClick}
          selectedDays={selectedDay!}
          renderDay={this.renderDay}
          weekdaysShort={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          navbarElement={this.renderChartHeader}
        />
        {this.renderExpandedInfo()}
      </div>
    );
  };

  renderEmptyChart = () => {
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <form onSubmit={event => this.onCreateChart(event, authUser)}>
              <button type="submit">Create a chart</button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  };

  renderAlbumDetails = () => {
    const { selectedDay } = this.state;

    if (!selectedDay) return null;

    return (
      <React.Fragment>
        <div className="albumImage">
          <Album
            src={
              this.getAlbumInfoForDay(selectedDay)
                ? this.getAlbumInfoForDay(selectedDay).artwork
                : null
            }
            alt={
              this.getAlbumInfoForDay(selectedDay) &&
              this.getAlbumInfoForDay(selectedDay).title
            }
          />
        </div>
        <div className="albumDetails">
          <h2 className="albumDetails-title">
            {this.getAlbumInfoForDay(selectedDay).title}
          </h2>
          <div className="albumDetails-artist">
            {this.getAlbumInfoForDay(selectedDay).artist}
          </div>
          {this.getAlbumInfoForDay(selectedDay).year}
          <div className="albumDetails-link">
            {this.getAlbumInfoForDay(selectedDay).source === "spotify" ? (
              <button>
                Listen on <FaSpotify /> Spotify
              </button>
            ) : (
              <button>
                Listen on <FaBandcamp /> Bandcamp
              </button>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  renderAddAlbum = () => {
    const {
      selectedDay,
      newAlbumTitle,
      newAlbumArtist,
      newAlbumYear,
      newAlbumArtworkUrl,
      newAlbumSource,
      newAlbumUri
    } = this.state;

    if (!selectedDay) return null;

    return (
      <React.Fragment>
        <form onSubmit={this.onCreateAlbum}>
          <div>Add an album for {format(selectedDay, "MMM d")}</div>
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
          <div>
            <input
              name="newAlbumTitle"
              type="text"
              placeholder="Title"
              value={newAlbumTitle}
              onChange={this.onChange}
            />
            <input
              name="newAlbumArtist"
              type="text"
              placeholder="Artist"
              value={newAlbumArtist}
              onChange={this.onChange}
            />
            <input
              name="newAlbumYear"
              type="number"
              placeholder="Year"
              value={newAlbumYear}
              onChange={this.onChange}
            />
            <input
              name="newAlbumArtworkUrl"
              type="url"
              placeholder="Artwork Url"
              value={newAlbumArtworkUrl}
              onChange={this.onChange}
            />
          </div>
          <button type="submit">Add album</button>
        </form>
      </React.Fragment>
    );
  };

  renderExpandedInfo = () => {
    const { selectedDay } = this.state;
    if (!selectedDay) return null;

    return (
      <Palette
        src={
          this.getAlbumInfoForDay(selectedDay) &&
          this.getAlbumInfoForDay(selectedDay).artwork
        }
      >
        {({ data }) => (
          <div
            className="expandedInfo"
            style={{
              gridRowStart: getWeekOfMonth(selectedDay) + 3,
              backgroundColor: data.lightVibrant,
              color: data.darkVibrant
            }}
          >
            {this.getAlbumInfoForDay(selectedDay)
              ? this.renderAlbumDetails()
              : this.renderAddAlbum()}
          </div>
        )}
      </Palette>
    );
  };

  render() {
    const { chartId } = this.props;
    const { error, isLoading } = this.state;

    const albumUrl = "http://musique.coeurdepirate.com/album/blonde";
    bandcamp.getAlbumInfo(albumUrl, function(error: any, albumInfo: any) {
      if (error) {
        console.log(error);
      } else {
        console.log(albumInfo);
      }
    });

    return error ? (
      <div>{error}</div>
    ) : isLoading ? (
      <div>Loading...</div>
    ) : chartId && !error ? (
      this.renderCalendar()
    ) : (
      this.renderEmptyChart()
    );
  }
}

const Chart = withFirebase(ChartBase);

export default Chart;

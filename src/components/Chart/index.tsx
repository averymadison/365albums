import React from "react";
import classNames from "classnames";
import {
  format,
  formatDistanceToNow,
  isPast,
  subDays,
  addDays
} from "date-fns";
import { AuthUserContext } from "../Session";
import Firebase, { withFirebase } from "../Firebase";
import DayPicker from "react-day-picker";
import "./chart.css";
import { FiEdit3, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import Album from "../Album";
import Search from "../Search";
import AlbumDetails from "../AlbumDetails";

export type Source = "bandcamp" | "spotify" | "custom";

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
  selectedDay: Date;
  isMinimalView: boolean;
}

const INITIAL_STATE = {
  isLoading: false,
  isEditing: false,
  error: "",
  title: "",
  updatedAt: null,
  albums: {},
  selectedDay: new Date(),
  isMinimalView: false
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
      } else {
        this.setState({ ...INITIAL_STATE });
      }
    });
  }

  componentWillUnmount() {
    const { firebase, chartId } = this.props;

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

  onDayClick = (day: Date) => {
    this.setState({ selectedDay: day });
  };

  onPreviousDayClick = () => {
    const { selectedDay } = this.state;
    this.setState({ selectedDay: subDays(selectedDay, 1) });
  };

  onNextDayClick = () => {
    const { selectedDay } = this.state;
    this.setState({ selectedDay: addDays(selectedDay, 1) });
  };

  onToggleMinimalView = () => {
    const { isMinimalView } = this.state;
    this.setState({ isMinimalView: !isMinimalView });
  };

  onTodayClick = () => {
    const currentCalendarRef = this.calendarRef.current;
    this.setState({ selectedDay: new Date() });
    currentCalendarRef!.showMonth(new Date());
  };

  getAlbumInfoForDay = (day: Date) => {
    const { albums } = this.state;
    const dateAsString = format(day, "yyyy-MM-dd");

    return albums[dateAsString];
  };

  renderChartHeader = (props: any) => {
    const { chartId } = this.props;
    const { title, isEditing, updatedAt } = this.state;

    const readableDate = formatDistanceToNow(new Date(updatedAt!));

    const { month, onPreviousClick, onNextClick } = props;

    return (
      <header className="chart-header">
        <div className="chart-title">
          {!isEditing ? (
            <React.Fragment>
              <h2>{title ? title : "Add a title..."}</h2>
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
        </div>
        <div className="chart-actions">
          <div className="chart-month">
            <button
              className="button icon-button"
              onClick={() => onPreviousClick()}
            >
              <FiArrowLeft />
            </button>
            <button
              className="button icon-button"
              onClick={() => onNextClick()}
            >
              <FiArrowRight />
            </button>
            <h3>{format(month, "MMMM YYY")}</h3>
          </div>
          <div className="chart-buttons">
            <button className="button" onClick={this.onTodayClick}>
              Today
            </button>
            <button className="button" onClick={this.onToggleMinimalView}>
              Toggle Details
            </button>
            <Link className="button" to={`chart/${chartId}`}>
              Share
            </Link>
          </div>
        </div>
      </header>
    );
  };

  renderDayDetails = (day: Date) => {
    const { isMinimalView } = this.state;

    return (
      isMinimalView && (
        <div className="dayDetails">
          {this.getAlbumInfoForDay(day) && (
            <div className="dayDetails__text">
              <div className="dayDetails__title">
                {this.getAlbumInfoForDay(day).title}
              </div>
              <div>{this.getAlbumInfoForDay(day).artist}</div>
            </div>
          )}
          <time dateTime={format(day, "yyyy-MM-dd")} className="dateBadge">
            {format(day, "d")}
          </time>
        </div>
      )
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
            <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
          </div>
        </div>
        <div className={classname}>
          <Album
            src={
              this.getAlbumInfoForDay(day) &&
              this.getAlbumInfoForDay(day).artwork
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
          onDayClick={this.onDayClick}
          selectedDays={selectedDay}
          renderDay={this.renderDay}
          navbarElement={this.renderChartHeader}
          weekdaysShort={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        />
        {this.renderDetails(selectedDay)}
      </div>
    );
  };

  renderEmptyChart = () => {
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h2>Couldn't find chart</h2>
            <form onSubmit={event => this.onCreateChart(event, authUser)}>
              <button type="submit">Create a chart</button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  };

  renderDetails = (day: Date) => {
    const { chartId } = this.props;

    return (
      <div className="detail-pane">
        <div className="current-day">
          <div className="current-day-buttons">
            <button
              className="button icon-button"
              onClick={this.onPreviousDayClick}
            >
              <FiArrowLeft />
            </button>
            <button
              className="button icon-button"
              onClick={this.onNextDayClick}
            >
              <FiArrowRight />
            </button>
          </div>
          <time dateTime={format(day, "yyyy-MM-dd")}>
            {format(day, "EEE MMM d")}
          </time>
          <span>
            {`${format(day, "DDD")} / 
              ${format(day.getFullYear(), "DDD")}`}
          </span>
        </div>
        {this.getAlbumInfoForDay(day) ? (
          <AlbumDetails
            chartId={chartId}
            title={this.getAlbumInfoForDay(day).title}
            artist={this.getAlbumInfoForDay(day).artist}
            albumUrl={this.getAlbumInfoForDay(day).artwork}
            tracks={this.getAlbumInfoForDay(day).tracks}
            length={this.getAlbumInfoForDay(day).length}
            releaseDate={this.getAlbumInfoForDay(day).releaseDate}
            source={this.getAlbumInfoForDay(day).source}
            uri={this.getAlbumInfoForDay(day).uri}
            day={day}
          />
        ) : (
          <Search selectedDay={day} chartId={chartId} />
        )}
      </div>
    );
  };

  render() {
    const { chartId } = this.props;
    const { error, isLoading } = this.state;

    return error ? (
      <div>{error}</div>
    ) : isLoading ? (
      <div>Loading...</div>
    ) : chartId ? (
      this.renderCalendar()
    ) : (
      this.renderEmptyChart()
    );
  }
}

const Chart = withFirebase(ChartBase);

export default Chart;

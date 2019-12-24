import React from "react";
import classNames from "classnames";
import {
  format,
  differenceInCalendarMonths,
  isPast,
  subDays,
  addDays,
  isWithinInterval,
  isBefore,
  isAfter,
  lastDayOfMonth,
  parse
} from "date-fns";
import Firebase, { withFirebase } from "../Firebase";
import DayPicker from "react-day-picker";
import "./chart.css";
import { FiArrowRight, FiArrowLeft, FiCalendar, FiShare } from "react-icons/fi";
import Album from "../Album";
import Search from "../Search";
import AlbumDetails from "../AlbumDetails";
import Spinner from "../Spinner";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";

export type Source = "bandcamp" | "spotify" | "discogs";

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
  fromMonth: Date;
  toMonth: Date;
  // Mobile only: is detail pane expanded?
  isDetailExpanded: boolean;
}

const INITIAL_STATE = {
  isLoading: false,
  isEditing: false,
  error: "",
  title: "",
  updatedAt: null,
  albums: {},
  selectedDay: new Date(),
  fromMonth: new Date(),
  toMonth: new Date(),
  isDetailExpanded: false
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
          albums: chart.albums ? chart.albums : {},
          fromMonth: parse(chart.fromMonth, "yyyy-M", new Date()),
          toMonth: parse(chart.toMonth, "yyyy-M", new Date())
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
    this.setState({ selectedDay: day, isDetailExpanded: true });
  };

  onPreviousDayClick = () => {
    const { selectedDay } = this.state;
    this.setState({ selectedDay: subDays(selectedDay, 1) });
  };

  onNextDayClick = () => {
    const { selectedDay } = this.state;
    this.setState({ selectedDay: addDays(selectedDay, 1) });
  };

  onTodayClick = () => {
    this.setState({ selectedDay: new Date() });
  };

  isTodayDisabled = () => {
    const { fromMonth, toMonth } = this.state;
    return isWithinInterval(new Date(), {
      start: fromMonth,
      end: toMonth
    });
  };

  isPreviousDayDisabled = () => {
    const { selectedDay, fromMonth } = this.state;
    return isBefore(subDays(selectedDay, 1), fromMonth);
  };

  isNextDayDisabled = () => {
    const { selectedDay, toMonth } = this.state;
    return isAfter(selectedDay, lastDayOfMonth(toMonth));
  };

  getAlbumInfoForDay = (day: Date) => {
    const { albums } = this.state;
    const dateAsString = format(day, "yyyy-MM-dd");

    return albums[dateAsString];
  };

  renderMonthHeader = (props: any) => {
    const { date } = props;

    return <h3 className="month-header">{format(date, "MMMM YYY")}</h3>;
  };

  renderDayDetails = (day: Date) => {
    return (
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
    );
  };

  renderDay = (day: Date) => {
    const classname = classNames("dayContents", {
      isPast: isPast(day.setHours(23, 59, 59))
    });

    // const ref = React.createRef();

    // this.ref.current.scrollIntoView({
    //   behavior: "smooth",
    //   block: "center",
    //   inline: "center"
    // });

    return (
      <div className={classname}>
        <Album
          src={
            this.getAlbumInfoForDay(day) && this.getAlbumInfoForDay(day).artwork
          }
          alt={
            this.getAlbumInfoForDay(day) && this.getAlbumInfoForDay(day).title
          }
        />
        {this.renderDayDetails(day)}
        <div className="selectedDate">
          <div className="selectedDate-contents">
            <time dateTime={format(day, "yyyy-MM-dd")}>
              <svg viewBox="0 0 100 100" fill="currentColor">
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {format(day, "d")}
                </text>
              </svg>
            </time>
          </div>
        </div>
      </div>
    );
  };

  renderCalendar = () => {
    const { selectedDay, toMonth, fromMonth, isDetailExpanded } = this.state;

    const monthRange = differenceInCalendarMonths(toMonth, fromMonth) + 1;
    const classname = classNames("calendar", {
      ["detailExpanded"]: isDetailExpanded
    });

    return (
      <div className={classname}>
        <DayPicker
          fromMonth={fromMonth}
          toMonth={toMonth}
          initialMonth={fromMonth}
          ref={this.calendarRef}
          numberOfMonths={monthRange}
          onDayClick={this.onDayClick}
          selectedDays={selectedDay}
          renderDay={this.renderDay}
          captionElement={this.renderMonthHeader}
          showWeekDays={false}
          navbarElement={() => null}
        />
        {this.renderDetails(selectedDay)}
      </div>
    );
  };

  renderDetails = (day: Date) => {
    const { chartId } = this.props;
    const { isDetailExpanded } = this.state;

    return (
      <div className="detail-pane">
        <button
          className="detail-grabber"
          onClick={() => this.setState({ isDetailExpanded: !isDetailExpanded })}
        ></button>
        {/* <div className="chart-title">
          {!isEditing ? (
            <h2 onClick={this.onToggleEditMode}>
              {title ? title : "Add a title..."}
            </h2>
          ) : (
            <form onSubmit={this.onSaveTitle}>
              <input
                name="title"
                type="text"
                placeholder="title"
                value={title}
                onChange={this.onChange}
                maxLength={32}
                autoFocus
              />
              <button type="submit">Save</button>
            </form>
          )}
          <small>{updatedAt && `Last edited ${readableDate} ago`}</small>
        </div> */}
        <div className="current-day">
          <div className="current-day-buttons">
            <button
              className="button icon-button"
              onClick={this.onPreviousDayClick}
              disabled={this.isPreviousDayDisabled()}
            >
              <FiArrowLeft />
            </button>
            <button
              className="button icon-button"
              onClick={this.onNextDayClick}
              disabled={this.isNextDayDisabled()}
            >
              <FiArrowRight />
            </button>
          </div>
          <div className="current-day-date">
            <time dateTime={format(day, "yyyy-MM-dd")}>
              {format(day, "EEE MMM d")}
            </time>
            <span>
              {`${format(day, "DDD")} / 
              ${format(day.getFullYear(), "DDD")}`}
            </span>
          </div>
          <div className="current-day-buttons">
            {!this.isTodayDisabled && (
              <button
                className="button icon-button"
                onClick={this.onTodayClick}
              >
                <FiCalendar />
              </button>
            )}
            <Link to={ROUTES.CHARTS} className="button icon-button">
              <FiShare />
            </Link>
          </div>
        </div>
        <div className="detail-pane-contents">
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
      </div>
    );
  };

  render() {
    const { error, isLoading } = this.state;

    return error ? (
      <div>{error}</div>
    ) : isLoading ? (
      <Spinner />
    ) : (
      this.renderCalendar()
    );
  }
}

const Chart = withFirebase(ChartBase);

export default Chart;

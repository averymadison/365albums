import "./chart.css";

import { Album, AlbumDetails, ChartHeader, Empty, Search, Spinner } from "..";
import Firebase, { withFirebase } from "../firebase";
import {
  addDays,
  differenceInCalendarMonths,
  format,
  getWeekOfMonth,
  isEqual,
  isSameMonth,
  isWithinInterval,
  parse,
  subDays
} from "date-fns";

import DateSwitcher from "../date-switcher/date-switcher";
import DayPicker from "react-day-picker";
import React from "react";
import classNames from "classnames";

export type Source = "bandcamp" | "spotify" | "discogs";

interface Props {
  firebase: Firebase;
  chartId: string;
  activeUserId: string;
}

interface State {
  isEditable: boolean;
  isLoading: boolean;
  error: any;
  albums: any;
  selectedDay: Date | null;
  fromMonth: Date;
  toMonth: Date;
}

const INITIAL_STATE = {
  isEditable: false,
  isLoading: false,
  error: "",
  albums: {},
  selectedDay: new Date(),
  fromMonth: new Date(),
  toMonth: new Date()
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
    const { firebase, chartId, activeUserId } = this.props;

    this.setState({ isLoading: true });

    let chart;

    firebase.chart(chartId).on("value", async snapshot => {
      chart = snapshot.val();

      if (chart) {
        await this.setState({
          isLoading: false,
          albums: chart.albums ? chart.albums : {},
          fromMonth: parse(chart.fromMonth, "yyyy-M", new Date()),
          toMonth: parse(chart.toMonth, "yyyy-M", new Date())
        });
      } else {
        await this.setState({ ...INITIAL_STATE });
      }

      if (chart.owner === activeUserId) {
        await this.setState({ isEditable: true });
      }
    });

    firebase.chart(chartId).once("value", snapshot => {
      chart = snapshot.val();

      if (chart) {
        this.setState({
          selectedDay: this.isTodayInRange
            ? new Date()
            : parse(chart.fromMonth, "yyyy-M", new Date())
        });
      }
    });
  }

  componentWillUnmount() {
    const { firebase, chartId } = this.props;

    firebase.chart(chartId).off();
  }

  onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  onDayClick = (day: Date) => {
    const { selectedDay } = this.state;
    isEqual(day, selectedDay!)
      ? this.setState({ selectedDay: null })
      : this.setState({ selectedDay: day });
  };

  onPreviousDayClick = () => {
    const { selectedDay } = this.state;
    this.setState({ selectedDay: subDays(selectedDay!, 1) });
  };

  onNextDayClick = () => {
    const { selectedDay } = this.state;
    this.setState({ selectedDay: addDays(selectedDay!, 1) });
  };

  onTodayClick = () => {
    this.setState({ selectedDay: new Date() });
  };

  isTodayInRange = () => {
    const { fromMonth, toMonth } = this.state;
    return isWithinInterval(new Date(), {
      start: fromMonth,
      end: toMonth
    });
  };

  getAlbumInfoForDay = (day: Date) => {
    const { albums } = this.state;
    const dateAsString = format(day, "yyyy-MM-dd");

    return albums[dateAsString];
  };

  renderMonthHeader = (props: any) => {
    const { date } = props;
    const { selectedDay } = this.state;

    return (
      <React.Fragment>
        <h3 className="month-header">{format(date, "MMMM YYY")}</h3>{" "}
        {isSameMonth(date, selectedDay!) && this.renderDetails(selectedDay!)}
      </React.Fragment>
    );
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
    const classname = classNames("dayContents");

    return (
      <div className={classname}>
        <Album
          src={
            this.getAlbumInfoForDay(day) && this.getAlbumInfoForDay(day).thumb
          }
          alt={
            this.getAlbumInfoForDay(day) && this.getAlbumInfoForDay(day).title
          }
          isAlwaysSquare
        />
        {this.renderDayDetails(day)}
        <div className="selectedDate">
          <div className="selectedDate-contents">
            <time dateTime={format(day, "yyyy-MM-dd")}>
              <svg viewBox="0 0 100 100" fill="currentColor">
                <text
                  x="50%"
                  y="52%"
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
    const { chartId } = this.props;
    const { selectedDay, toMonth, fromMonth, isEditable } = this.state;

    const monthRange = differenceInCalendarMonths(toMonth, fromMonth) + 1;

    return (
      <div className="calendar">
        <ChartHeader chartId={chartId} isEditable={isEditable} />
        <DayPicker
          fromMonth={fromMonth}
          toMonth={toMonth}
          initialMonth={fromMonth}
          ref={this.calendarRef}
          numberOfMonths={monthRange}
          onDayClick={this.onDayClick}
          selectedDays={selectedDay!}
          renderDay={this.renderDay}
          captionElement={this.renderMonthHeader}
          showWeekDays={false}
        />
      </div>
    );
  };

  renderDetails = (day: Date) => {
    const { chartId } = this.props;
    const { isEditable, fromMonth, toMonth } = this.state;

    const albumInfoExistsForDay = this.getAlbumInfoForDay(day);
    const albumSrc = albumInfoExistsForDay
      ? this.getAlbumInfoForDay(day).artwork
      : null;

    return (
      <div
        className="detail-pane"
        style={{ gridRowStart: getWeekOfMonth(day) + 2 }}
      >
        <div className="albumImage">
          <Album src={albumSrc} />
        </div>
        <div className="detail-pane-contents">
          <DateSwitcher
            day={day}
            onNextDayClick={this.onNextDayClick}
            onPreviousDayClick={this.onPreviousDayClick}
            fromMonth={fromMonth}
            toMonth={toMonth}
          />
          {albumInfoExistsForDay ? (
            <AlbumDetails
              isEditable={isEditable}
              chartId={chartId}
              title={this.getAlbumInfoForDay(day).title}
              artist={this.getAlbumInfoForDay(day).artist}
              tracks={this.getAlbumInfoForDay(day).tracks}
              length={this.getAlbumInfoForDay(day).length}
              releaseDate={this.getAlbumInfoForDay(day).releaseDate}
              source={this.getAlbumInfoForDay(day).source}
              uri={this.getAlbumInfoForDay(day).uri}
              day={day}
              isListened={this.getAlbumInfoForDay(day).isListened}
            />
          ) : isEditable ? (
            <Search selectedDay={day} chartId={chartId} />
          ) : (
            <Empty title="No album for this day" />
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

import React from 'react';
import classNames from 'classnames';
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
} from 'date-fns';
import Firebase, { withFirebase } from '../Firebase';
import DayPicker from 'react-day-picker';
import './chart.css';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import Album from '../Album';
import Search from '../Search';
import AlbumDetails from '../AlbumDetails';
import Spinner from '../Spinner';
import ChartHeader from '../ChartHeader';
import Empty from '../Empty';

export type Source = 'bandcamp' | 'spotify' | 'discogs';

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
  selectedDay: Date;
  fromMonth: Date;
  toMonth: Date;
  // Mobile only: is detail pane expanded?
  isDetailExpanded: boolean;
}

const INITIAL_STATE = {
  isEditable: false,
  isLoading: false,
  error: '',
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
    const { firebase, chartId, activeUserId } = this.props;

    this.setState({ isLoading: true });

    let chart;

    firebase.chart(chartId).on('value', async snapshot => {
      chart = snapshot.val();

      if (chart) {
        await this.setState({
          isLoading: false,
          albums: chart.albums ? chart.albums : {},
          fromMonth: parse(chart.fromMonth, 'yyyy-M', new Date()),
          toMonth: parse(chart.toMonth, 'yyyy-M', new Date())
        });
      } else {
        await this.setState({ ...INITIAL_STATE });
      }

      if (chart.owner === activeUserId) {
        await this.setState({ isEditable: true });
      }
    });

    firebase.chart(chartId).once('value', snapshot => {
      chart = snapshot.val();

      if (chart) {
        this.setState({
          selectedDay: this.isTodayInRange
            ? parse(chart.fromMonth, 'yyyy-M', new Date())
            : new Date()
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

  isTodayInRange = () => {
    const { fromMonth, toMonth } = this.state;
    return isWithinInterval(new Date(), {
      start: fromMonth,
      end: toMonth
    });
  };

  isPreviousDayInRange = () => {
    const { selectedDay, fromMonth } = this.state;
    return isBefore(subDays(selectedDay, 1), fromMonth);
  };

  isNextDayInRange = () => {
    const { selectedDay, toMonth } = this.state;
    return isAfter(selectedDay, lastDayOfMonth(toMonth));
  };

  getAlbumInfoForDay = (day: Date) => {
    const { albums } = this.state;
    const dateAsString = format(day, 'yyyy-MM-dd');

    return albums[dateAsString];
  };

  renderMonthHeader = (props: any) => {
    const { date } = props;

    return <h3 className="month-header">{format(date, 'MMMM YYY')}</h3>;
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
        <time dateTime={format(day, 'yyyy-MM-dd')} className="dateBadge">
          {format(day, 'd')}
        </time>
      </div>
    );
  };

  renderDay = (day: Date) => {
    const classname = classNames('dayContents', {
      isPast: isPast(day.setHours(23, 59, 59))
    });

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
            <time dateTime={format(day, 'yyyy-MM-dd')}>
              <svg viewBox="0 0 100 100" fill="currentColor">
                <text
                  x="50%"
                  y="52%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {format(day, 'd')}
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
    const classname = classNames('calendar', {
      detailExpanded: isDetailExpanded
    });

    return (
      <div className={classname}>
        {this.renderDetails(selectedDay)}
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
      </div>
    );
  };

  renderDetails = (day: Date) => {
    const { chartId } = this.props;
    const { isDetailExpanded, isEditable } = this.state;

    return (
      <div className="detail-pane">
        <button
          className="detail-grabber"
          onClick={() => this.setState({ isDetailExpanded: !isDetailExpanded })}
        ></button>
        <div className="current-day">
          <button
            className="button icon-button"
            onClick={this.onPreviousDayClick}
            disabled={this.isPreviousDayInRange()}
          >
            <FiArrowLeft />
          </button>
          <div
            className="current-day-date"
            onClick={() =>
              this.setState({ isDetailExpanded: !isDetailExpanded })
            }
          >
            <time dateTime={format(day, 'yyyy-MM-dd')}>
              {format(day, 'EEE MMM d')}
            </time>
            <span>
              {`${format(day, 'DDD')} / 
              ${format(day.getFullYear(), 'DDD')}`}
            </span>
          </div>
          <button
            className="button icon-button"
            onClick={this.onNextDayClick}
            disabled={this.isNextDayInRange()}
          >
            <FiArrowRight />
          </button>
        </div>
        <div className="detail-pane-contents">
          {this.getAlbumInfoForDay(day) ? (
            <AlbumDetails
              isEditable={isEditable}
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
    const { chartId } = this.props;
    const { error, isLoading, isEditable } = this.state;

    return error ? (
      <div>{error}</div>
    ) : isLoading ? (
      <Spinner />
    ) : (
      <React.Fragment>
        <ChartHeader chartId={chartId} isEditable={isEditable} />
        {this.renderCalendar()}
      </React.Fragment>
    );
  }
}

const Chart = withFirebase(ChartBase);

export default Chart;

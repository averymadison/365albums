import "./date-switcher.css";

import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { format, isAfter, isBefore, lastDayOfMonth, subDays } from "date-fns";

import React from "react";

export interface Props {
  day: Date;
  onPreviousDayClick: () => void;
  onNextDayClick: () => void;
  fromMonth: Date;
  toMonth: Date;
}

const DateSwitcher = (props: Props) => {
  const { day, onPreviousDayClick, onNextDayClick, fromMonth, toMonth } = props;

  const isPreviousDayInRange = () => {
    return isBefore(subDays(day!, 1), fromMonth);
  };

  const isNextDayInRange = () => {
    return isAfter(day!, lastDayOfMonth(toMonth));
  };

  return (
    <div className="date-switcher">
      <button
        className="button icon-button"
        onClick={onPreviousDayClick}
        disabled={isPreviousDayInRange()}
      >
        <FiArrowLeft />
      </button>
      <div className="date-switcher-date">
        <time dateTime={format(day, "yyyy-MM-dd")}>
          {format(day, "EEE MMM d")}
        </time>
        <span>
          {`${format(day, "DDD")} / 
              ${format(day.getFullYear(), "DDD")}`}
        </span>
      </div>
      <button
        className="button icon-button"
        onClick={onNextDayClick}
        disabled={isNextDayInRange()}
      >
        <FiArrowRight />
      </button>
    </div>
  );
};

export default DateSwitcher;

import { useMemo, useState } from "react";
import { displayDate, displayHalfAnHourTimeRange } from "../../utils/date";
import { matchStatusBarColor } from "../../utils/device";
import { Picker } from "zmp-ui";
import { useNotes } from "../../store/noteStore";
import React from "react";

// Opening hours: 7:00 - 21:00
const OPENING_HOUR = 7;
const CLOSING_HOUR = 21;

const TimePicker = () => {
  const [date, setDate] = useNotes.deliveryDate();
  const [time, setTime] = useNotes.deliveryTime();

  console.log("date", date)
  console.log("time",time)

  const availableDates = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = today.getHours() >= CLOSING_HOUR ? 1 : 0; i < 5; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, []);

  const availableTimes = useMemo(() => {
    const times = [];
    const now = new Date();
    let time = new Date();
    if (now.getDate() === new Date(date).getDate()) {
      const minutes = Math.ceil(now.getMinutes() / 30) * 30;
      time.setHours(now.getHours());
      time.setMinutes(minutes);
    } else {
      time.setHours(OPENING_HOUR);
      time.setMinutes(0);
    }
    time.setSeconds(0);
    time.setMilliseconds(0);
    const endTime = new Date();
    endTime.setHours(CLOSING_HOUR);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);
    while (time <= endTime) {
      times.push(new Date(time));
      time.setMinutes(time.getMinutes() + 30);
    }
    return times;
  }, [date]);

  return (
    <Picker
      mask
      maskClosable
      onVisibilityChange={(visible) => matchStatusBarColor(visible)}
      inputClass="border-none bg-transparent text-sm text-primary font-medium text-md m-0 p-0 h-auto"
      placeholder="Chọn thời gian nhận hàng"
      title="Thời gian nhận hàng"
      value={{
        date,
        time: availableTimes.find((t) => +t === time) ? time : +availableTimes[0],
      }}
      formatPickedValueDisplay={({ date, time }) =>
        date && time
          ? `${displayHalfAnHourTimeRange(new Date(time.value))}, ${displayDate(new Date(date.value))}`
          : `Chọn thời gian`
      }
      onChange={({ date, time }) => {
        if (date) {
          setDate(+date.value);
        }
        if (time) {
          setTime(+time.value);
        }
      }}
      data={[
        {
          options: availableTimes.map((time) => ({
            displayName: displayHalfAnHourTimeRange(time),
            value: +time,
          })),
          name: "time",
        },
        {
          options: availableDates.map((date) => ({
            displayName: displayDate(date, true),
            value: +date,
          })),
          name: "date",
        },
      ]}
    />
  );
};

export default TimePicker;

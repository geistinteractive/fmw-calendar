import React, { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import momentPlugin from "@fullcalendar/moment";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import { getConfig } from "fmw-utils";
import {
  transformEvent,
  newEventFetcher,
  dispatchEventToFm,
  getFirstDay
} from "./eventUtils";
import {
  eventRender,
  handleEventDrop,
  handleEventResize,
  handleEventSelect
} from "./events";
import theme from "./event.themes";
import "./main.scss";

export default function Calendar({ AddonUUID, Meta, Config }) {
  const fetchEvents = newEventFetcher(Config);

  const calendarComponentRef = useRef();
  const getCalendarObj = () => {
    return calendarComponentRef.current.calendar;
  };

  //run on mount
  useEffect(sendViewStateToFM, []);

  function sendViewStateToFM() {
    const calendar = getCalendarObj();
    const calendarView = calendar.view;

    const obj = {
      title: calendarView.title,
      type: calendarView.type,
      activeStart: calendarView.activeStart,
      activeEnd: calendarView.activeEnd,
      currentStart: calendarView.currentStart,
      currentEnd: calendarView.currentEnd,
      currentDate: calendar.state.currentDate
    };

    dispatchEventToFm("ViewStateChanged", obj);
  }

  window.Calendar_Refresh = () => {
    const calendar = getCalendarObj();
    console.log("refresh");

    calendar.refetchEvents();
  };

  window.Calendar_SetView = view => {
    const calendar = getCalendarObj();
    calendar.changeView(view);
    sendViewStateToFM();
  };

  window.Calendar_Next = () => {
    const calendar = getCalendarObj();
    calendar.next();
    sendViewStateToFM();
  };
  window.Calendar_Prev = () => {
    const calendar = getCalendarObj();
    calendar.prev();
    sendViewStateToFM();
  };

  window.Calendar_Today = () => {
    const calendar = getCalendarObj();
    calendar.today();
    sendViewStateToFM();
  };

  const styles = theme(Config.DefaultEventStyle.value);
  let startView = getConfig("StartingView");
  if (startView.toLowerCase() === "day") {
    startView = "timeGridDay";
  } else if (startView.toLowerCase() === "week") {
    startView = "timeGridWeek";
  } else {
    startView = "dayGridMonth";
  }

  const firstDay = getFirstDay();
  console.log(firstDay);

  return (
    <div className="demo-app">
      <div className="demo-app-calendar">
        <FullCalendar
          firstDay={firstDay}
          nowIndicator={true}
          selectable={true}
          eventDataTransform={transformEvent}
          defaultView={startView}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            momentPlugin,
            bootstrapPlugin
          ]}
          header={{ left: "", center: "", right: "" }}
          ref={calendarComponentRef}
          eventSources={[
            {
              events: fetchEvents,
              ...styles
            }
          ]}
          eventBackgroundColor="#E7F5FA"
          eventTextColor="#00425E"
          eventBorderColor="#B9E1F1"
          eventRender={eventRender}
          eventResize={handleEventResize}
          eventDrop={handleEventDrop}
          select={handleEventSelect}
          style={{ borderRadius: "10px" }}
          editable={true}
          lazyFetching={false}
          themeSystem="bootstrap"
        />
      </div>
    </div>
  );
}

Calendar.defaultProps = {
  defaultView: "timeGridWeek"
};

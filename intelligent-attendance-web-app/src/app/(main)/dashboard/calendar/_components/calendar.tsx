"use client";

import * as React from "react";

import { useCalendarController } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import multiMonthPlugin from "@fullcalendar/react/multimonth";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { differenceInCalendarDays, endOfMonth, format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, XIcon } from "lucide-react";

import { EventCalendarViews } from "@/components/calendar/event-calendar-views";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { apiClient } from "@/lib/api-client";
import { courseSectionService } from "@/services/academic.service";

const views = [
  { key: "dayGridMonth", label: "Tháng" },
  { key: "timeGridWeek", label: "Tuần" },
  { key: "timeGridDay", label: "Ngày" },
];

const plugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin];

const defaultPeriodTimes: { [key: number]: { start: string; end: string } } = {
  1: { start: "07:00:00", end: "07:50:00" },
  2: { start: "07:55:00", end: "08:45:00" },
  3: { start: "09:00:00", end: "09:50:00" },
  4: { start: "09:55:00", end: "10:45:00" },
  5: { start: "10:50:00", end: "11:40:00" },
  6: { start: "12:30:00", end: "13:20:00" },
  7: { start: "13:25:00", end: "14:15:00" },
  8: { start: "14:30:00", end: "15:20:00" },
  9: { start: "15:25:00", end: "16:15:00" },
  10: { start: "16:20:00", end: "17:10:00" },
  11: { start: "18:00:00", end: "18:50:00" },
  12: { start: "18:55:00", end: "19:45:00" },
  13: { start: "19:50:00", end: "20:40:00" },
};

function getDynamicSessionTimes(
  dateStr: string,
  startPeriod: number,
  numPeriods: number,
  periodMap: { [key: number]: { start: string; end: string } }
) {
  const dateOnly = dateStr.split("T")[0];
  const combinedMap = { ...defaultPeriodTimes, ...periodMap };

  const startCfg = combinedMap[startPeriod];
  const endPeriod = startPeriod + numPeriods - 1;
  const endCfg = combinedMap[endPeriod] || startCfg;

  const startH = startCfg?.start || "08:00:00";
  const endH = endCfg?.end || startCfg?.end || "11:00:00";

  return {
    start: `${dateOnly}T${startH}`,
    end: `${dateOnly}T${endH}`,
  };
}

export function Calendar() {
  const controller = useCalendarController();
  const [events, setEvents] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [eventCount, setEventCount] = React.useState(0);
  const [dateInfo, setDateInfo] = React.useState(() => {
    const now = new Date();

    return {
      title: format(now, "MMMM yyyy"),
      days: differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1,
    };
  });

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const [data, periodConfigs] = await Promise.all([
        courseSectionService.getMySessions(),
        apiClient<any[]>("/configs/periods", { method: "GET" }).catch(() => []),
      ]);

      const periodMap: { [key: number]: { start: string; end: string } } = {};
      if (Array.isArray(periodConfigs)) {
        periodConfigs.forEach((p: any) => {
          periodMap[p.periodNumber] = {
            start: p.startTime.includes(":") ? (p.startTime.split(":").length === 2 ? `${p.startTime}:00` : p.startTime) : "08:00:00",
            end: p.endTime.includes(":") ? (p.endTime.split(":").length === 2 ? `${p.endTime}:00` : p.endTime) : "11:00:00",
          };
        });
      }

      const mapped = (data || []).map((session: any) => {
        const cs = session.courseSectionId;
        const sub = cs && typeof cs.subjectId === "object" ? cs.subjectId.name : "";

        const titleStr = `${sub || "Buổi học"} - Phòng ${session.room}`;
        const times = getDynamicSessionTimes(session.date, session.startPeriod, session.numPeriods, periodMap);

        let color = "#e0f2fe"; // Scheduled: Soft Blue background
        let textColor = "#0369a1"; // Dark Blue text
        let displayTitle = titleStr;

        if (session.status === "completed") {
          color = "#d1fae5"; // Completed: Soft Green background
          textColor = "#047857"; // Dark Green text
        } else if (session.status === "cancelled") {
          color = "#fee2e2"; // Cancelled: Soft Red background
          textColor = "#b91c1c"; // Dark Red text
          displayTitle = `[HỦY] ${titleStr}`;
        }

        return {
          id: session._id,
          title: displayTitle,
          start: times.start,
          end: times.end,
          color: color, // Set color directly (this sets --fc-event-color)
          textColor: textColor, // Set textColor directly (this sets --fc-event-contrast-color)
          extendedProps: {
            status: session.status,
            lecturer: session.lecturerId?.fullName || "Chưa gán",
            periods: `Tiết ${session.startPeriod} - ${session.startPeriod + session.numPeriods - 1}`,
            eventColor: color,
            eventTextColor: textColor,
          },
        };
      });
      setEvents(mapped);
    } catch (error) {
      console.error("Failed to load sessions for calendar", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadSessions();
  }, []);

  const title = dateInfo.title;
  const days = dateInfo.days;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border">
      <div className="flex flex-col gap-4 border-b bg-sidebar p-4 text-sidebar-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 shrink-0 flex-col gap-1">
          <div className="font-medium text-lg leading-none">{title}</div>
          <p className="text-muted-foreground text-sm">
            {days} ngày - {eventCount} lịch học
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse mr-2">Đang tải lịch học...</span>
          )}
          <ButtonGroup>
            <Button size="icon" variant="outline" onClick={() => controller.prev()}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={() => controller.today()}>
              Hôm nay
            </Button>
            <Button size="icon" variant="outline" onClick={() => controller.next()}>
              <ChevronRight />
            </Button>
          </ButtonGroup>
          <Select
            value={controller.view?.type ?? views[0].key}
            onValueChange={(value) => {
              controller.changeView(value);
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {views.map((v) => (
                  <SelectItem key={v.key} value={v.key}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EventCalendarViews
        controller={controller}
        initialView={views[0].key}
        plugins={[...plugins]}
        popoverCloseContent={() => <XIcon className="size-5 text-muted-foreground group-hover:text-foreground" />}
        events={events}
        nowIndicator
        eventDidMount={(info) => {
          const props = info.event.extendedProps || {};
          const color = props.eventColor;
          const textColor = props.eventTextColor;
          if (color) {
            info.el.style.setProperty("--fc-event-color", color);
          }
          if (textColor) {
            info.el.style.setProperty("--fc-event-contrast-color", textColor);
          }
          const titleEl = info.el.querySelector(".fc-event-title");
          if (titleEl) {
            (titleEl as HTMLElement).style.whiteSpace = "pre-line";
            (titleEl as HTMLElement).style.wordBreak = "break-word";
          }
        }}
        datesSet={(info) => {
          setDateInfo({
            title: info.view.title,
            days: differenceInCalendarDays(info.view.currentEnd, info.view.currentStart),
          });
          setEventCount(
            events.filter((event) => {
              const start = new Date(event.start);

              return start >= info.start && start < info.end;
            }).length,
          );
        }}
      />
    </div>
  );
}

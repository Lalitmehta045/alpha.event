"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────
type ClockMode = "hour" | "minute";
type Period = "AM" | "PM";

interface CheckoutDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSelectDate: (date: Date | undefined) => void;
  onConfirm: (date: Date) => void;
}

// ─── Analog Clock Component ─────────────────────────────────────────
function AnalogClock({
  hour,
  minute,
  period,
  mode,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
  onModeChange,
  isToday,
  minHour24,
  minMinute,
}: {
  hour: number;
  minute: number;
  period: Period;
  mode: ClockMode;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onPeriodChange: (p: Period) => void;
  onModeChange: (m: ClockMode) => void;
  isToday: boolean;
  minHour24: number;
  minMinute: number;
}) {
  const clockRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Clock geometry
  const CLOCK_SIZE = 240;
  const CENTER = CLOCK_SIZE / 2;
  const NUMBER_RADIUS = 90;

  // Helper: convert 12h to 24h
  const to24 = useCallback((h: number, p: Period) => {
    if (p === "AM" && h === 12) return 0;
    if (p === "PM" && h !== 12) return h + 12;
    return h;
  }, []);

  // Check if a given hour (12h format) is disabled
  const isHourDisabled = useCallback(
    (h12: number) => {
      if (!isToday) return false;
      const h24 = to24(h12, period);
      return h24 < minHour24;
    },
    [isToday, period, minHour24, to24]
  );

  // Check if a given minute is disabled (only relevant when hour matches min hour)
  const isMinuteDisabled = useCallback(
    (m: number) => {
      if (!isToday) return false;
      const h24 = to24(hour, period);
      if (h24 < minHour24) return true;
      if (h24 === minHour24) return m < minMinute;
      return false;
    },
    [isToday, hour, period, minHour24, minMinute, to24]
  );

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!clockRef.current) return 0;
      const rect = clockRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      // angle from 12 o'clock, clockwise
      let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return angle;
    },
    []
  );

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const angle = getAngleFromEvent(clientX, clientY);
      if (mode === "hour") {
        let h = Math.round(angle / 30) % 12;
        if (h === 0) h = 12;
        if (!isHourDisabled(h)) {
          onHourChange(h);
        }
      } else {
        let m = Math.round(angle / 6) % 60;
        if (!isMinuteDisabled(m)) {
          onMinuteChange(m);
        }
      }
    },
    [mode, getAngleFromEvent, onHourChange, onMinuteChange, isHourDisabled, isMinuteDisabled]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as Element)?.setPointerCapture?.(e.pointerId);
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      (e.target as Element)?.releasePointerCapture?.(e.pointerId);
      if (mode === "hour") {
        onModeChange("minute");
      }
    },
    [mode, onModeChange]
  );

  // Calculate hand angle
  const handAngle = useMemo(() => {
    if (mode === "hour") {
      return ((hour % 12) / 12) * 360;
    }
    return (minute / 60) * 360;
  }, [mode, hour, minute]);

  // Render clock numbers
  const numbers = useMemo(() => {
    if (mode === "hour") {
      return Array.from({ length: 12 }, (_, i) => {
        const num = i === 0 ? 12 : i;
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + NUMBER_RADIUS * Math.cos(rad);
        const y = CENTER + NUMBER_RADIUS * Math.sin(rad);
        const isSelected = num === hour;
        const disabled = isHourDisabled(num);
        return { num, x, y, isSelected, disabled };
      });
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const num = i * 5;
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + NUMBER_RADIUS * Math.cos(rad);
        const y = CENTER + NUMBER_RADIUS * Math.sin(rad);
        const isSelected = num === minute;
        const disabled = isMinuteDisabled(num);
        return { num, x, y, isSelected, disabled };
      });
    }
  }, [mode, hour, minute, CENTER, NUMBER_RADIUS, isHourDisabled, isMinuteDisabled]);

  // Hand endpoint
  const HAND_LENGTH = 75;
  const handRad = ((handAngle - 90) * Math.PI) / 180;
  const handEndX = CENTER + HAND_LENGTH * Math.cos(handRad);
  const handEndY = CENTER + HAND_LENGTH * Math.sin(handRad);

  // Tick marks
  const ticks = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const angle = (i / 60) * 360 - 90;
      const rad = (angle * Math.PI) / 180;
      const isMajor = i % 5 === 0;
      const outerR = 108;
      const innerR = isMajor ? 100 : 104;
      return {
        x1: CENTER + innerR * Math.cos(rad),
        y1: CENTER + innerR * Math.sin(rad),
        x2: CENTER + outerR * Math.cos(rad),
        y2: CENTER + outerR * Math.sin(rad),
        isMajor,
      };
    });
  }, [CENTER]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Digital display */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onModeChange("hour")}
          className={`text-4xl font-mono font-bold px-3 py-1 rounded-lg transition-all duration-300 ${
            mode === "hour"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
        >
          {String(hour).padStart(2, "0")}
        </button>
        <span className="text-4xl font-bold text-gray-300 animate-pulse">:</span>
        <button
          type="button"
          onClick={() => onModeChange("minute")}
          className={`text-4xl font-mono font-bold px-3 py-1 rounded-lg transition-all duration-300 ${
            mode === "minute"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
        >
          {String(minute).padStart(2, "0")}
        </button>
        <div className="flex flex-col ml-2 gap-1">
          <button
            type="button"
            onClick={() => onPeriodChange("AM")}
            className={`text-xs font-bold px-2 py-0.5 rounded-md transition-all duration-300 ${
              period === "AM"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-600 border border-gray-200"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange("PM")}
            className={`text-xs font-bold px-2 py-0.5 rounded-md transition-all duration-300 ${
              period === "PM"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-600 border border-gray-200"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Analog clock face */}
      <div
        ref={clockRef}
        className="relative select-none touch-none cursor-pointer"
        style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg
          width={CLOCK_SIZE}
          height={CLOCK_SIZE}
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
        >
          {/* Outer ring gradient */}
          <defs>
            <radialGradient id="clockBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="85%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
            <filter id="clockShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000015" />
            </filter>
            <filter id="handGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Clock face */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER - 4}
            fill="url(#clockBg)"
            stroke="#e2e8f0"
            strokeWidth="2"
            filter="url(#clockShadow)"
          />

          {/* Inner ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER - 12}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1"
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isMajor ? "#94a3b8" : "#cbd5e1"}
              strokeWidth={t.isMajor ? 2 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* Selected number highlight */}
          {numbers.map((n) =>
            n.isSelected && !n.disabled ? (
              <circle
                key={`sel-${n.num}`}
                cx={n.x}
                cy={n.y}
                r={18}
                fill="#3b82f6"
                className="transition-all duration-300"
              />
            ) : null
          )}

          {/* Clock hand */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={handEndX}
            y2={handEndY}
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#handGlow)"
            className="transition-all duration-200"
          />

          {/* Hand end circle */}
          <circle
            cx={handEndX}
            cy={handEndY}
            r={4}
            fill="#3b82f6"
            className="transition-all duration-200"
          />

          {/* Center dot */}
          <circle cx={CENTER} cy={CENTER} r={5} fill="#3b82f6" />
          <circle cx={CENTER} cy={CENTER} r={2.5} fill="white" />

          {/* Numbers */}
          {numbers.map((n) => (
            <text
              key={`num-${n.num}`}
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={n.disabled ? "#d1d5db" : n.isSelected ? "white" : "#475569"}
              fontSize={14}
              fontWeight={n.isSelected && !n.disabled ? "700" : "500"}
              fontFamily="system-ui, sans-serif"
              className="pointer-events-none transition-all duration-200"
              opacity={n.disabled ? 0.4 : 1}
            >
              {mode === "minute" ? String(n.num).padStart(2, "0") : n.num}
            </text>
          ))}
        </svg>
      </div>

      {/* Mode indicator */}
      <p className="text-xs text-gray-400 font-medium">
        {mode === "hour" ? "Select hour • tap to set" : "Select minutes • tap to set"}
      </p>
    </div>
  );
}

// ─── Main Dialog ────────────────────────────────────────────────────
export default function CheckoutDateDialog({
  open,
  onOpenChange,
  selectedDate,
  onSelectDate,
  onConfirm,
}: CheckoutDateDialogProps) {
  const [step, setStep] = useState<"date" | "time">("date");
  const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate);
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<Period>("AM");
  const [clockMode, setClockMode] = useState<ClockMode>("hour");

  useEffect(() => {
    if (open) {
      setTempDate(selectedDate);
      setStep("date");
      setClockMode("hour");
      // If a date was previously selected with time info, restore it
      if (selectedDate) {
        const h = selectedDate.getHours();
        setHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
        setMinute(selectedDate.getMinutes());
        setPeriod(h >= 12 ? "PM" : "AM");
      } else {
        setHour(10);
        setMinute(0);
        setPeriod("AM");
      }
    }
  }, [open, selectedDate]);

  const formattedTempDate = useMemo(() => {
    if (!tempDate) return null;
    return tempDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [tempDate]);

  const formattedTime = useMemo(() => {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
  }, [hour, minute, period]);

  // Check if selected date is today
  const isTodaySelected = useMemo(() => {
    if (!tempDate) return false;
    const today = new Date();
    return (
      tempDate.getFullYear() === today.getFullYear() &&
      tempDate.getMonth() === today.getMonth() &&
      tempDate.getDate() === today.getDate()
    );
  }, [tempDate]);

  // Minimum allowed hour (24h format) - current hour if today
  const minHour24 = useMemo(() => {
    if (!isTodaySelected) return 0;
    return new Date().getHours();
  }, [isTodaySelected]);

  // Minimum allowed minute for the current selected hour
  const minMinuteForHour = useMemo(() => {
    if (!isTodaySelected) return 0;
    const now = new Date();
    const currentH24 = now.getHours();
    // Convert selected hour to 24h
    let selectedH24 = hour;
    if (period === "AM" && hour === 12) selectedH24 = 0;
    else if (period === "PM" && hour !== 12) selectedH24 = hour + 12;
    if (selectedH24 === currentH24) return now.getMinutes();
    return 0;
  }, [isTodaySelected, hour, period]);

  // Check if the currently selected time is valid (not in the past)
  const isTimeValid = useMemo(() => {
    if (!isTodaySelected) return true;
    const now = new Date();
    let selectedH24 = hour;
    if (period === "AM" && hour === 12) selectedH24 = 0;
    else if (period === "PM" && hour !== 12) selectedH24 = hour + 12;
    if (selectedH24 > now.getHours()) return true;
    if (selectedH24 === now.getHours() && minute >= now.getMinutes()) return true;
    return false;
  }, [isTodaySelected, hour, minute, period]);

  // When switching to time step, auto-adjust time if it's today and current time is past
  const handleDateNext = () => {
    if (!tempDate) return;
    // If today is selected, ensure time is not in the past
    const today = new Date();
    const isToday =
      tempDate.getFullYear() === today.getFullYear() &&
      tempDate.getMonth() === today.getMonth() &&
      tempDate.getDate() === today.getDate();
    if (isToday) {
      const nowH = today.getHours();
      const nowM = today.getMinutes();
      // Convert current selection to 24h
      let selH24 = hour;
      if (period === "AM" && hour === 12) selH24 = 0;
      else if (period === "PM" && hour !== 12) selH24 = hour + 12;
      // If selected time is in the past, auto-adjust to next valid time
      if (selH24 < nowH || (selH24 === nowH && minute < nowM)) {
        // Round up to next 30 min slot
        let newM = nowM < 30 ? 30 : 0;
        let newH24 = nowM < 30 ? nowH : nowH + 1;
        if (newH24 >= 24) {
          newH24 = 23;
          newM = 59;
        }
        const newPeriod: Period = newH24 >= 12 ? "PM" : "AM";
        let newH12 = newH24 % 12;
        if (newH12 === 0) newH12 = 12;
        setHour(newH12);
        setMinute(newM);
        setPeriod(newPeriod);
      }
    }
    setStep("time");
  };

  // Handle period change with validation
  const handlePeriodChange = (newPeriod: Period) => {
    if (isTodaySelected) {
      const now = new Date();
      let newH24 = hour;
      if (newPeriod === "AM" && hour === 12) newH24 = 0;
      else if (newPeriod === "PM" && hour !== 12) newH24 = hour + 12;
      // Don't allow switching to AM if current time is PM
      if (newH24 < now.getHours()) {
        return; // block the switch
      }
      // If switching makes the time exactly the current hour, ensure minute is valid
      if (newH24 === now.getHours() && minute < now.getMinutes()) {
        setMinute(now.getMinutes());
      }
    }
    setPeriod(newPeriod);
  };

  // Handle minute change with validation
  const handleMinuteChange = (m: number) => {
    if (isTodaySelected) {
      const now = new Date();
      let selH24 = hour;
      if (period === "AM" && hour === 12) selH24 = 0;
      else if (period === "PM" && hour !== 12) selH24 = hour + 12;
      if (selH24 === now.getHours() && m < now.getMinutes()) {
        return; // block past minutes
      }
      if (selH24 < now.getHours()) {
        return; // block entirely if hour is past
      }
    }
    setMinute(m);
  };

  const handleConfirm = () => {
    if (!tempDate) return;
    // Combine date + time
    const finalDate = new Date(tempDate);
    let h24 = hour;
    if (period === "AM" && hour === 12) h24 = 0;
    else if (period === "PM" && hour !== 12) h24 = hour + 12;
    finalDate.setHours(h24, minute, 0, 0);
    onSelectDate(finalDate);
    onConfirm(finalDate);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTempDate(selectedDate);
      setStep("date");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              {step === "date" ? (
                <>
                  <CalendarDays className="w-5 h-5" />
                  Select Delivery Date
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  Select Delivery Time
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm mt-1">
              {step === "date"
                ? "Choose your preferred delivery date."
                : "Set a convenient delivery time."}
            </DialogDescription>
          </DialogHeader>

          {/* Selected info pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formattedTempDate && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                <CalendarDays className="w-3 h-3" />
                {formattedTempDate}
              </span>
            )}
            {step === "time" && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                <Clock className="w-3 h-3" />
                {formattedTime}
              </span>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step === "date"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              1
            </div>
            <span className={`text-xs font-medium ${step === "date" ? "text-blue-600" : "text-gray-500"}`}>
              Date
            </span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200 rounded">
            <div
              className={`h-full rounded transition-all duration-500 ${
                step === "time" ? "w-full bg-blue-600" : "w-0 bg-blue-600"
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step === "time"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              2
            </div>
            <span className={`text-xs font-medium ${step === "time" ? "text-blue-600" : "text-gray-400"}`}>
              Time
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {step === "date" ? (
            <div className="flex flex-col items-center gap-4">
              <Calendar
                mode="single"
                selected={tempDate}
                onSelect={setTempDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-xl border shadow-sm"
              />
            </div>
          ) : (
            <AnalogClock
              hour={hour}
              minute={minute}
              period={period}
              mode={clockMode}
              onHourChange={setHour}
              onMinuteChange={handleMinuteChange}
              onPeriodChange={handlePeriodChange}
              onModeChange={setClockMode}
              isToday={isTodaySelected}
              minHour24={minHour24}
              minMinute={minMinuteForHour}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 px-6 py-4 bg-gray-50 border-t">
          {step === "time" ? (
            <Button
              variant="ghost"
              onClick={() => setStep("date")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
          )}

          {step === "date" ? (
            <Button
              onClick={handleDateNext}
              disabled={!tempDate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-md shadow-blue-500/20"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!isTimeValid}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock className="w-4 h-4 mr-1.5" />
              {isTimeValid ? "Confirm Date & Time" : "Select a future time"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

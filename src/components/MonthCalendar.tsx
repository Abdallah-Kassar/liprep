import React, { useState, useMemo } from 'react';

// Helper: Convert Hex color to RGB object
const hexToRgb = (hex) => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((char) => char + char).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

// Helper: Format date as YYYY-MM-DD
const formatDateKey = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function MonthCalendar({
  activityData = {},         // Format: { "YYYY-MM-DD": number }
  themeColor = '#243a5c',     // Hex theme color
  showMonthLabel = true,      // Show/hide month & year header
  showWeekdayLabels = true,   // Show/hide Sun, Mon, Tue labels
  showNavButtons = true,      // Show/hide navigation buttons underneath
  showLegend = true,          // Show/hide color intensity legend
  unitLabel = 'questions',    // Unit label used in the hover tooltip
  maxWidth = '360px',         // Container max width (increase to make larger)
  onDayClick = () => {},
}) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [hoveredDay, setHoveredDay] = useState(null);

  // Parse RGB from theme color
  const rgb = useMemo(() => hexToRgb(themeColor), [themeColor]);

  // Calculate maximum activity value for dynamic intensity scaling
  const maxActivity = useMemo(() => {
    const values = Object.values(activityData);
    if (values.length === 0) return 1;
    const max = Math.max(...values);
    return max > 0 ? max : 1;
  }, [activityData]);

  // Generate days array - capped at 5 rows max (35 cells)
  const calendarDays = useMemo(() => {
    let firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // MAX ROWS LOGIC:
    // A 5-row grid has 35 total cells (5 * 7).
    // If (firstDayOfWeek + daysInMonth) > 35, it would force a 6th row.
    // Shift offset back so month fits strictly within 5 rows (max offset = 35 - daysInMonth).
    const maxAllowedOffset = 35 - daysInMonth;
    if (firstDayOfWeek > maxAllowedOffset) {
      firstDayOfWeek = Math.max(0, maxAllowedOffset);
    }

    const days = [];

    // Placeholder cells for weekday offset (hidden)
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ isPlaceholder: true });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatDateKey(currentYear, currentMonth, d);
      days.push({
        isPlaceholder: false,
        day: d,
        dateKey,
        activity: activityData[dateKey] || 0,
        isToday:
          d === today.getDate() &&
          currentMonth === today.getMonth() &&
          currentYear === today.getFullYear(),
      });
    }

    return days;
  }, [currentYear, currentMonth, activityData, today]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };
  const getBackgroundColor = (activity, maxActivity) => {
    // Normalize ratio between 0 (min activity) and 1 (max activity)
    const ratio = Math.min(Math.max(activity / maxActivity, 0), 1);
    // Define start (low intensity) and end (high intensity) colors
    const lowActivity = { r: 200, g: 229, b: 249 };   // #c8e5f9
    const highActivity = { r: 38, g: 62, b: 102 };  // #263e66
    // Interpolate each color component based on the ratio
    const r = Math.round(lowActivity.r + (highActivity.r - lowActivity.r) * ratio);
    const g = Math.round(lowActivity.g + (highActivity.g - lowActivity.g) * ratio);
    const b = Math.round(lowActivity.b + (highActivity.b - lowActivity.b) * ratio);
    return {
      backgroundColor: `rgb(${r}, ${g}, ${b})`,
    };
  };

  // Dynamic day cell background color
  const getDayStyle = (dayObj) => {
    const { activity } = dayObj;
    if (!activity || activity <= 0) {
      return { backgroundColor: '#f3f4f6' };
    }

    // Intensity ratio scaling
    const ratio = Math.min(Math.max(activity / maxActivity, 0.15), 1);
    return getBackgroundColor(activity, maxActivity);
  };

  return (
    <div style={{ ...styles.container, maxWidth }}>
      {/* Optional Top Month Header */}
      {showMonthLabel && (
        <div style={styles.header}>
          <h2 style={styles.monthTitle}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>
      )}

      {/* Optional Weekday Labels Row */}
      {showWeekdayLabels && (
        <div style={styles.weekdayRow}>
          {WEEKDAYS.map((day) => (
            <div key={day} style={styles.weekdayCell}>
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Days Grid */}
      <div style={styles.grid}>
        {calendarDays.map((dayObj, index) => {
          if (dayObj.isPlaceholder) {
            return <div key={`ph-${index}`} style={styles.hiddenCell} />;
          }

          const style = getDayStyle(dayObj);
          const isHovered = hoveredDay?.dateKey === dayObj.dateKey;

          return (
            <div
              key={dayObj.dateKey}
              style={{
                ...styles.dayCell,
                ...style,
                border: dayObj.isToday ? `2px solid ${themeColor}` : 'none',
              }}
              onMouseEnter={() => setHoveredDay(dayObj)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => onDayClick(dayObj.dateKey, dayObj.activity)}
            >
              {/* Custom Small Hover Tooltip (e.g., "Aug 13: 5 questions") */}
              {isHovered && (
                <div style={styles.tooltip}>
                  {SHORT_MONTH_NAMES[currentMonth]} {dayObj.day}: {dayObj.activity}{' '}
                  {dayObj.activity === 1 ? unitLabel.replace(/s$/, '') : unitLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional Intensity Legend */}
      {showLegend && (
        <div style={styles.legendContainer}>
          <span style={styles.legendText}>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => (
            <div
              key={idx}
              style={{
                ...styles.legendBox,
                backgroundColor:
                  step === 0
                    ? '#f3f4f6'
                    : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(step, 0.2)})`,
              }}
            />
          ))}
          <span style={styles.legendText}>More</span>
        </div>
      )}

      {/* Optional Bottom Navigation Buttons */}
      {showNavButtons && (
        <div style={styles.bottomNavContainer}>
          <button style={styles.navButton} onClick={handlePrevMonth} title="Previous Month">
            &#8249;
          </button>
          <button style={styles.navButton} onClick={handleNextMonth} title="Next Month">
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
}

/* 
  <div style={{ padding: '30px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

    1. Standard Calendar 
  
    <MonthCalendar
      activityData={sampleData}
      themeColor="#3b82f6"
      showMonthLabel={true}
      showWeekdayLabels={true}
      showNavButtons={true}
      showLegend={true}
    />

    2. Minimal & Custom Sized (Larger cells)
  
    <MonthCalendar
      activityData={sampleData}
      themeColor="#243a5c"
      showMonthLabel={false}
      showWeekdayLabels={false}
      showNavButtons={false}
      showLegend={false}
      maxWidth="200px" // Increases physical size of grid cells!
    />
  </div>
*/

// Inline Styles
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minWidth: '200px',
    margin: '0 auto',
    padding: '16px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '12px',
  },
  monthTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
  },
  weekdayRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.72rem',
    color: '#9ca3af',
    marginBottom: '6px',
  },
  weekdayCell: {
    padding: '2px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
  },
  hiddenCell: {
    visibility: 'hidden',
  },
  dayCell: {
    aspectRatio: '1',
    borderRadius: '10px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.1s ease',
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '0.68rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 100,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    marginTop: '12px',
  },
  legendText: {
    fontSize: '0.68rem',
    color: '#9ca3af',
  },
  legendBox: {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
  },
  bottomNavContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '14px',
  },
  navButton: {
    width: '32px',
    height: '28px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
  },
};

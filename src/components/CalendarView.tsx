import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ShoppingCart, Gift } from 'lucide-react'; // Icons
import { ShoppingEntry } from '../types';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isSameMonth, addMonths, subMonths, isToday 
} from 'date-fns'; // Date utilities

// Props: Calendar receives a list of shopping entries (planned trips with coupons, spend, etc.)
interface CalendarViewProps {
  entries: ShoppingEntry[];
}

export default function CalendarView({ entries }: CalendarViewProps) {
  // State for the currently visible month
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Tooltip state: which entry is being hovered, and mouse position
  const [hoveredEntry, setHoveredEntry] = useState<ShoppingEntry | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate month boundaries and all days in month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Helper: return all entries scheduled for a given date
  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => isSameDay(entry.date, date));
  };

  // Navigation controls for switching months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Tooltip event handlers
  const handleMouseEnter = (entry: ShoppingEntry, event: React.MouseEvent) => {
    setHoveredEntry(entry); // store hovered entry
    setMousePosition({ x: event.clientX, y: event.clientY }); // initial position
  };
  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY }); // update position
  };
  const handleMouseLeave = () => {
    setHoveredEntry(null); // clear tooltip
  };

  // Compute empty cells before the month starts (to align weekdays correctly)
  const startDay = monthStart.getDay(); // 0=Sun, 1=Mon...
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  return (
    <div className="card">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        {/* Left side: calendar icon + title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dunnes-lightgreen rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Shopping Calendar</h2>
            <p className="text-sm text-gray-600">Next 10 weeks overview</p>
          </div>
        </div>
        
        {/* Right side: navigation buttons + month name */}
        <div className="flex items-center gap-2">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ---- Calendar Grid ---- */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Empty cells to align first day */}
        {emptyDays.map(day => (
          <div key={`empty-${day}`} className="p-2 h-20"></div>
        ))}

        {/* Render days in current month */}
        {daysInMonth.map(date => {
          const dayEntries = getEntriesForDate(date); // entries for this date
          const hasEntries = dayEntries.length > 0;
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isTodayDate = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`
                p-2 h-20 border border-gray-200 relative cursor-pointer transition-all duration-200
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}   // Gray out non-current month days
                ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''} // Highlight today
                ${hasEntries ? 'hover:bg-green-50 hover:border-green-300' : 'hover:bg-gray-100'}
              `}
            >
              {/* Date number */}
              <div className={`text-sm ${isTodayDate ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                {format(date, 'd')}
              </div>
              
              {/* Shopping entries */}
              {hasEntries && (
                <div className="mt-1 space-y-1">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="text-xs p-1 rounded bg-dunnes-green text-white cursor-pointer hover:bg-dunnes-lightgreen transition-colors"
                      onMouseEnter={(e) => handleMouseEnter(entry, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Entry summary: planned spend + coupon indicator */}
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        <span>€{entry.plannedAmount.toFixed(0)}</span>
                        {entry.couponEarned && <Gift className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Tooltip ---- */}
      {hoveredEntry && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm pointer-events-none"
          style={{
            left: mousePosition.x + 10,   // offset near cursor
            top: mousePosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          {/* Tooltip content */}
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-dunnes-green" />
              <span className="font-semibold text-gray-900">
                Shopping Trip - {format(hoveredEntry.date, 'MMM do, yyyy')}
              </span>
            </div>
            
            {/* Details */}
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Planned Spend:</span>
                <span className="font-medium">€{hoveredEntry.plannedAmount.toFixed(2)}</span>
              </div>
              
              {hoveredEntry.couponUsed && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon Used:</span>
                  <span className="font-medium text-dunnes-gold">-€{hoveredEntry.couponUsed.value}</span>
                </div>
              )}
              
              {hoveredEntry.couponEarned && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon Earned:</span>
                  <span className="font-medium text-green-600">
                    €{hoveredEntry.couponEarned.value} off €{hoveredEntry.couponEarned.minSpend}+
                  </span>
                </div>
              )}
              
              {hoveredEntry.savings > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Savings:</span>
                  <span className="font-medium text-green-600">€{hoveredEntry.savings.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            {/* Coupon validity period */}
            {hoveredEntry.couponEarned && (
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                Valid: {format(hoveredEntry.couponEarned.validFrom, 'MMM do')} - {format(hoveredEntry.couponEarned.validUntil, 'MMM do')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Legend ---- */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-dunnes-green rounded"></div>
          <span className="text-gray-600">Shopping Trip</span>
        </div>
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-dunnes-gold" />
          <span className="text-gray-600">Coupon Earned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  );
}

import * as React from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface DateTimePicker24hProps {
  value?: string
  onChange: (value: string) => void
  min?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker24h({
  value,
  onChange,
  min,
  placeholder = 'Select date and time',
  className,
  disabled = false,
}: DateTimePicker24hProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minutes = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => i * 5),
    [],
  )

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined

    const parsedDate = new Date(value)
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
  }, [value])

  const minDate = React.useMemo(() => {
    if (!min) return undefined

    const parsedDate = new Date(min)
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
  }, [min])

  const handleDateSelect = (nextDate: Date | undefined) => {
    if (!nextDate) return

    const baseDate = selectedDate ? new Date(selectedDate) : nextDate
    const mergedDate = new Date(nextDate)

    mergedDate.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0)

    if (minDate && mergedDate.getTime() < minDate.getTime()) {
      onChange(toDateTimeLocalValue(minDate))
      return
    }

    onChange(toDateTimeLocalValue(mergedDate))
  }

  const handleTimeChange = (type: 'hour' | 'minute', numericValue: number) => {
    const baseDate = selectedDate ? new Date(selectedDate) : new Date()

    if (type === 'hour') {
      baseDate.setHours(numericValue)
    } else {
      baseDate.setMinutes(numericValue)
    }

    baseDate.setSeconds(0, 0)

    if (minDate && baseDate.getTime() < minDate.getTime()) {
      onChange(toDateTimeLocalValue(minDate))
      return
    }

    onChange(toDateTimeLocalValue(baseDate))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          type="button"
          variant="outline"
          className={cn(
            'h-12 w-full justify-start border-white/10 bg-zinc-950/70 text-left font-normal text-zinc-100 hover:bg-zinc-950/70',
            !selectedDate && 'text-zinc-500',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, 'dd MMM yyyy, HH:mm')
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border-white/10 bg-zinc-900 p-0 text-zinc-50"
      >
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={minDate ? { before: minDate } : undefined}
            classNames={{
              today:
                'rounded-(--cell-radius) bg-cyan-400/15 text-cyan-300 data-[selected=true]:rounded-none',
              day: 'group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none',
            }}
            components={{
              DayButton: ({
                className: dayBtnClass,
                day,
                modifiers,
                ...dayBtnProps
              }) => {
                const isSelected =
                  modifiers.selected &&
                  !modifiers.range_start &&
                  !modifiers.range_end &&
                  !modifiers.range_middle

                return (
                  <Button
                    variant="ghost"
                    size="icon"
                    data-day={day.date.toLocaleDateString()}
                    data-selected-single={isSelected}
                    className={cn(
                      'relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal',
                      isSelected &&
                        'bg-cyan-400 text-zinc-950 hover:bg-cyan-300 hover:text-zinc-950',
                      dayBtnClass,
                    )}
                    {...dayBtnProps}
                  />
                )
              },
            }}
          />
          <div className="flex flex-col divide-y divide-white/10 sm:h-75 sm:flex-row sm:divide-x sm:divide-y-0">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {[...hours].reverse().map((hour) => {
                  const isSelected =
                    selectedDate != null && selectedDate.getHours() === hour

                  return (
                    <Button
                      key={hour}
                      size="icon"
                      type="button"
                      variant={isSelected ? 'default' : 'ghost'}
                      className={cn(
                        'aspect-square shrink-0 sm:w-full',
                        isSelected &&
                          'bg-cyan-400 text-zinc-950 hover:bg-cyan-300 hover:text-zinc-950',
                      )}
                      onClick={() => handleTimeChange('hour', hour)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Button>
                  )
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {minutes.map((minute) => {
                  const isSelected =
                    selectedDate != null && selectedDate.getMinutes() === minute

                  return (
                    <Button
                      key={minute}
                      size="icon"
                      type="button"
                      variant={isSelected ? 'default' : 'ghost'}
                      className={cn(
                        'aspect-square shrink-0 sm:w-full',
                        isSelected &&
                          'bg-cyan-400 text-zinc-950 hover:bg-cyan-300 hover:text-zinc-950',
                      )}
                      onClick={() => handleTimeChange('minute', minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  )
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function toDateTimeLocalValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    setDate?: (date: Date | undefined) => void
    disabled?: boolean
    readOnly?: boolean
    placeholder?: string
    className?: string
    id?: string
}

export function DatePicker({
    date,
    setDate,
    disabled = false,
    readOnly = false,
    placeholder = "Pick a date",
    className,
    id
}: DatePickerProps) {
    // If readOnly, we don't open the popover, just show the button
    const [isOpen, setIsOpen] = React.useState(false)

    const handleOpenChange = (open: boolean) => {
        if (readOnly || disabled) {
            setIsOpen(false)
            return
        }
        setIsOpen(open)
    }

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        (disabled || readOnly) && "opacity-100 cursor-default bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    onClick={(e) => {
                        if (readOnly || disabled) {
                            e.preventDefault()
                            e.stopPropagation()
                        }
                    }}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "yyyy-MM-dd") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            {!readOnly && !disabled && (
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        required={true}
                    />
                </PopoverContent>
            )}
        </Popover>
    )
}

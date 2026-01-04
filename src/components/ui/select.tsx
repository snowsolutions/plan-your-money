import * as React from "react"
import { cn } from "@/utils/cn"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
    return (
        <div className="relative inline-block w-full">
            <select
                ref={ref}
                className={cn(
                    "flex h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
        </div>
    )
})
Select.displayName = "Select"

export { Select }

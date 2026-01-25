"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700",
                outline:
                    "border border-input bg-transparent text-foreground hover:bg-blue-50 hover:text-blue-600",
                ghost: "hover:bg-blue-50 hover:text-blue-600",
                secondary: "bg-gray-900 text-white hover:bg-gray-800",
                subtle: "bg-blue-100 text-blue-700 hover:bg-blue-200",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-full px-3",
                lg: "h-11 rounded-full px-8",
                icon: "h-10 w-10 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
        )
    },
)
Button.displayName = "Button"

export { Button, buttonVariants }

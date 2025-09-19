import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const rocButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "gradient-button",
        secondary: "gradient-section text-foreground hover:bg-secondary/80",
        outline: "border border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground",
        ghost: "text-foreground hover:bg-secondary hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        selected: "gradient-button shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface RocButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rocButtonVariants> {
  asChild?: boolean
}

const RocButton = React.forwardRef<HTMLButtonElement, RocButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(rocButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
RocButton.displayName = "RocButton"

export { RocButton, rocButtonVariants }
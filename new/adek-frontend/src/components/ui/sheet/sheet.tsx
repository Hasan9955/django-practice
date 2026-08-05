/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming cn utility is available

// Context to manage sheet state
interface SheetContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  side: "top" | "bottom" | "left" | "right"
}
const SheetContext = React.createContext<SheetContextType | undefined>(undefined)

const useSheetContext = () => {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error("useSheetContext must be used within a Sheet component")
  }
  return context
}

interface SheetProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: "top" | "bottom" | "left" | "right"
}

const Sheet = ({ children, open, onOpenChange, side = "right" }: SheetProps) => {
  const [isOpen, setIsOpen] = useState(open !== undefined ? open : false)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    },
    [onOpenChange],
  )

  return <SheetContext.Provider value={{ isOpen, setIsOpen: handleOpenChange, side }}>{children}</SheetContext.Provider>
}

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { setIsOpen } = useSheetContext()

  const handleClick = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  if (asChild) {
    // Ensure children is a single React element
    const child = React.Children.only(children);
    if (React.isValidElement(child)) {
      const typedChild = child as React.ReactElement<any>;
      return React.cloneElement(typedChild, {
        ...typedChild.props,
        onClick: (e: React.MouseEvent) => {
          handleClick();
          // Preserve original onClick if it exists
          if (typeof typedChild.props.onClick === "function") {
            typedChild.props.onClick(e);
          }
        },
      });
    }
    return null;
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  )
}

const SheetClose = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  const { setIsOpen } = useSheetContext()
  return (
    <button
      type="button"
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className,
      )}
      onClick={() => setIsOpen(false)}
    >
      {children || <X className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </button>
  )
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  forceMount?: boolean
}

const SheetContent = ({ className, children, ...props }: SheetContentProps) => {
  const { isOpen, setIsOpen, side } = useSheetContext()
  const contentRef = useRef<HTMLDivElement>(null)

  const sheetClasses = cn(
    "fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform ease-in-out duration-500",
    {
      "inset-x-0 top-0 border-b": side === "top",
      "inset-x-0 bottom-0 border-t": side === "bottom",
      "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm": side === "left",
      "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm": side === "right",
    },
    isOpen
      ? {
          "translate-y-0": side === "top" || side === "bottom",
          "translate-x-0": side === "left" || side === "right",
        }
      : {
          "-translate-y-full": side === "top",
          "translate-y-full": side === "bottom",
          "-translate-x-full": side === "left",
          "translate-x-full": side === "right",
        },
    className,
  )

  const overlayClasses = cn(
    "fixed inset-0 z-40 bg-black/80 transition-opacity duration-300",
    isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
  )

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, setIsOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, setIsOpen])

  if (!isOpen && !props.forceMount) return null // Only render if open or forceMount is true

  return (
    <>
      <div className={overlayClasses} aria-hidden={!isOpen} />
      <div ref={contentRef} className={sheetClasses} {...props} role="dialog" aria-modal="true" aria-hidden={!isOpen}>
        {children}
      </div>
    </>
  )
}

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)
SheetDescription.displayName = "SheetDescription"

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }

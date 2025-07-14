"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right" | "top" | "bottom";
  }
>(({ side = "right", className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-40" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-white shadow-lg transition-transform",
        side === "right" && "inset-y-0 right-0 w-80 translate-x-full data-[state=open]:translate-x-0",
        side === "left" && "inset-y-0 left-0 w-80 -translate-x-full data-[state=open]:translate-x-0",
        side === "top" && "inset-x-0 top-0 h-1/3 -translate-y-full data-[state=open]:translate-y-0",
        side === "bottom" && "inset-x-0 bottom-0 h-1/3 translate-y-full data-[state=open]:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export const SheetTitle = DialogPrimitive.Title;

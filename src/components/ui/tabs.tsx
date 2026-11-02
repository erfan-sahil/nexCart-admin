"use client"

import * as React from "react"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border border-border/80 bg-muted/50 p-1 shadow-inner shadow-black/[0.02]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-9 cursor-pointer items-center justify-center rounded-[calc(var(--radius-lg)-2px)] px-3.5 py-2 text-sm font-medium whitespace-nowrap",
        "text-muted-foreground transition-[color,background-color,box-shadow,transform] duration-200 ease-out",
        "hover:bg-background/80 hover:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        "data-[state=active]:shadow-md data-[state=active]:shadow-primary/25",
        "data-[state=active]:hover:bg-primary/90 data-[state=active]:hover:text-primary-foreground",
        "dark:data-[state=active]:shadow-primary/15",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none data-[state=inactive]:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }

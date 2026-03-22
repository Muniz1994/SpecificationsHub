import * as React from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef(
  ({ orientation = "horizontal", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientation === "vertical" && "flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = React.forwardRef(
  ({ defaultSize, minSize, maxSize, children, className, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        flex: `0 0 ${defaultSize}%`,
        minWidth: minSize ? `${minSize}%` : undefined,
        maxWidth: maxSize ? `${maxSize}%` : undefined,
      }}
      className={cn("overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
)
ResizablePanel.displayName = "ResizablePanel"

const ResizableHandle = React.forwardRef(
  ({ withHandle, className, onDragStart, ...props }, ref) => {
    const handleRef = React.useRef(null)

    React.useEffect(() => {
      const handle = handleRef.current
      if (!handle) return

      let isResizing = false
      let startX = 0
      let startY = 0

      const container = handle.parentElement
      if (!container) return

      const onMouseDown = (e) => {
        isResizing = true
        startX = e.clientX
        startY = e.clientY
        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
      }

      const onMouseMove = (e) => {
        if (!isResizing || !container) return

        const diff = e.clientX - startX
        const panels = container.querySelectorAll("[data-panel]")

        if (panels.length >= 2) {
          const firstPanel = panels[0]
          const secondPanel = panels[1]

          const firstWidth = firstPanel.offsetWidth
          const secondWidth = secondPanel.offsetWidth
          const totalWidth = firstWidth + secondWidth

          const newFirstWidth = ((firstWidth + diff) / container.offsetWidth) * 100
          const newSecondWidth = ((secondWidth - diff) / container.offsetWidth) * 100

          if (newFirstWidth > 15 && newSecondWidth > 50) {
            firstPanel.style.flex = `0 0 ${newFirstWidth}%`
            secondPanel.style.flex = `0 0 ${newSecondWidth}%`
            startX = e.clientX
          }
        }
      }

      const onMouseUp = () => {
        isResizing = false
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }

      handle.addEventListener("mousedown", onMouseDown)

      return () => {
        handle.removeEventListener("mousedown", onMouseDown)
      }
    }, [])

    return (
      <div
        ref={handleRef}
        className={cn(
          "w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize flex-shrink-0",
          className
        )}
        {...props}
      >
        {withHandle && (
          <div className="h-full flex items-center justify-center">
            <div className="h-4 w-3 rounded-sm border bg-border flex items-center justify-center">
              <GripVertical className="h-2.5 w-2.5" />
            </div>
          </div>
        )}
      </div>
    )
  }
)
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }


import { Button } from "@/components/ui/button"

export function App() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex max-w-md flex-col gap-3 text-sm">
        <h1 className="text-lg font-semibold">NexCart Admin</h1>
        <p className="text-muted-foreground">
          Vite + React + TypeScript + Tailwind + shadcn/ui is ready.
        </p>
        <Button className="w-fit">Get started</Button>
      </div>
    </div>
  )
}

export default App

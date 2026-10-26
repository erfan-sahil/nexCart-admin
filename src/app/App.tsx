import { RouterProvider } from "react-router"

import { QueryProvider } from "@/app/providers/query-provider"
import { router } from "@/app/routes"
import { AuthProvider } from "@/features/auth/components"

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  )
}

export default App

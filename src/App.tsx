import { RouterProvider } from "react-router"

import { QueryProvider } from "@/components/providers/query-provider"
import { AuthProvider } from "@/features/auth/auth-provider"
import { router } from "@/routes/router"

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

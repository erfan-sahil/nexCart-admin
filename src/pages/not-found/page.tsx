import { Link } from "react-router"

export function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center rounded-xl border border-border bg-card px-4 py-16 text-center text-card-foreground shadow-sm sm:px-6">
      <p className="text-sm font-medium">Page not found</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        That address is not part of the admin.
      </p>
      <Link
        to="/"
        className="mt-4 text-sm font-medium text-brand-text hover:underline"
      >
        Back to dashboard
      </Link>
    </section>
  )
}

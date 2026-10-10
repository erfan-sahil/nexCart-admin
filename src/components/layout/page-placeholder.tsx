export function PagePlaceholder() {
  return (
    <section className="mx-auto w-full max-w-6xl rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="px-4 py-16 text-center sm:px-6">
        <p className="text-sm font-medium">No records loaded</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          This page is ready for admin data. Records will show here once the API
          is connected.
        </p>
      </div>
    </section>
  )
}

type SectionViewProps = {
  title: string
  description: string
}

export function SectionView({ title, description }: SectionViewProps) {
  return (
    <section className="mx-auto w-full max-w-6xl rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-border px-4 py-5 sm:px-6">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="px-4 py-10 text-center sm:px-6">
        <p className="text-sm font-medium">No records loaded</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          This section is ready for admin data. Records will show here once the
          API is connected.
        </p>
      </div>
    </section>
  )
}

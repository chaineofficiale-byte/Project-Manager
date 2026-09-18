interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const ROUNDED_MAP = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

export function Skeleton({ className = '', rounded = 'xl' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/70 ${ROUNDED_MAP[rounded]} ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />
    </div>
  )
}

const PAGE_BG = 'linear-gradient(135deg, #f8fafc 0%, #f8fafc 50%, #eef2ff 100%)'

/* ===== DASHBOARD SKELETON ===== */

export function DashboardSkeleton() {
  return (
    <div
      className="min-h-screen animate-fade-in"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" rounded="lg" />
            <Skeleton className="h-4 w-32" rounded="lg" />
          </div>
          <Skeleton className="h-11 w-44" rounded="xl" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Search & filter bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-11 flex-1" rounded="xl" />
          <Skeleton className="h-12 w-64" rounded="2xl" />
        </div>

        {/* Card grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-card-enter rounded-3xl border border-gray-200/70 bg-white/70 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              {/* Card header */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <Skeleton className="h-6 w-32" rounded="lg" />
                <Skeleton className="h-6 w-20" rounded="full" />
              </div>

              {/* Description lines */}
              <div className="mb-4 space-y-2">
                <Skeleton className="h-4 w-full" rounded="lg" />
                <Skeleton className="h-4 w-3/4" rounded="lg" />
              </div>

              {/* Link count */}
              <Skeleton className="mb-3 h-3 w-24" rounded="lg" />

              {/* Dates */}
              <div className="mb-4 space-y-1.5">
                <Skeleton className="h-3 w-36" rounded="lg" />
                <Skeleton className="h-3 w-40" rounded="lg" />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 border-t border-gray-100 pt-4">
                <Skeleton className="h-8 flex-1" rounded="xl" />
                <Skeleton className="h-8 w-20" rounded="xl" />
                <Skeleton className="h-8 w-20" rounded="xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===== PROJECT DETAILS SKELETON ===== */

export function ProjectDetailsSkeleton() {
  return (
    <div
      className="min-h-screen animate-fade-in"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {/* Back button */}
        <div className="pt-6">
          <Skeleton className="h-10 w-44" rounded="xl" />
        </div>

        {/* Hero */}
        <div className="mt-4 rounded-3xl border border-gray-200/70 bg-white/70 p-8 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" rounded="full" />
              <Skeleton className="h-10 w-72" rounded="lg" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-36" rounded="full" />
                <Skeleton className="h-8 w-36" rounded="full" />
              </div>
            </div>
            <Skeleton className="h-40 w-40 shrink-0" rounded="full" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-7 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-9 w-9" rounded="xl" />
                <Skeleton className="h-3 w-32" rounded="lg" />
              </div>
              <div className="space-y-2.5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white/60 px-4 py-3">
                    <Skeleton className="h-4 w-56" rounded="lg" />
                    <Skeleton className="h-4 w-16" rounded="lg" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-7 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-9 w-9" rounded="xl" />
                <Skeleton className="h-3 w-40" rounded="lg" />
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white/60 p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" rounded="lg" />
                  <Skeleton className="h-4 w-10" rounded="lg" />
                </div>
                <div className="my-3 h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" rounded="lg" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-4" rounded="md" />
                    <Skeleton className="h-4 w-4" rounded="md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-7 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-9 w-9" rounded="xl" />
                <Skeleton className="h-3 w-20" rounded="lg" />
              </div>
              <Skeleton className="h-12 w-full" rounded="xl" />
            </div>
            <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-7 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-9 w-9" rounded="xl" />
                <Skeleton className="h-3 w-24" rounded="lg" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" rounded="lg" />
                <Skeleton className="h-4 w-3/4" rounded="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== FORM SKELETON (New/Edit) ===== */

export function FormSkeleton() {
  return (
    <div
      className="min-h-screen animate-fade-in"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-5 h-10 w-44" rounded="xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11" rounded="2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" rounded="lg" />
            <Skeleton className="h-3 w-64" rounded="lg" />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-8 space-y-5">
          {/* Name field */}
          <div>
            <Skeleton className="mb-2 h-4 w-28" rounded="lg" />
            <Skeleton className="h-11 w-full" rounded="xl" />
          </div>

          {/* Links */}
          <div>
            <Skeleton className="mb-2 h-4 w-32" rounded="lg" />
            <div className="space-y-2">
              <Skeleton className="h-11 w-full" rounded="xl" />
              <Skeleton className="h-11 w-full" rounded="xl" />
            </div>
            <Skeleton className="mt-2 h-7 w-36" rounded="xl" />
          </div>

          {/* Credentials */}
          <div>
            <Skeleton className="mb-2 h-4 w-40" rounded="lg" />
            <div className="space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-11 flex-1" rounded="xl" />
                <Skeleton className="h-11 flex-1" rounded="xl" />
                <Skeleton className="h-11 w-11" rounded="xl" />
              </div>
            </div>
            <Skeleton className="mt-2 h-7 w-44" rounded="xl" />
          </div>

          {/* Status */}
          <div>
            <Skeleton className="mb-2 h-4 w-16" rounded="lg" />
            <Skeleton className="h-11 w-full" rounded="xl" />
          </div>

          {/* Date */}
          <div>
            <Skeleton className="mb-2 h-4 w-28" rounded="lg" />
            <Skeleton className="h-11 w-full" rounded="xl" />
          </div>

          {/* Description */}
          <div>
            <Skeleton className="mb-2 h-4 w-24" rounded="lg" />
            <Skeleton className="h-24 w-full" rounded="xl" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-44" rounded="xl" />
            <Skeleton className="h-11 w-24" rounded="xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== SETTINGS SKELETON ===== */

export function SettingsSkeleton() {
  return (
    <div
      className="min-h-screen animate-fade-in"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-5 h-10 w-44" rounded="xl" />
        <Skeleton className="h-8 w-40" rounded="lg" />
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 pb-16 sm:px-6">
        {/* Profile card */}
        <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14" rounded="2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" rounded="lg" />
              <Skeleton className="h-4 w-48" rounded="lg" />
            </div>
          </div>
        </div>

        {/* Password form */}
        <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" rounded="xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-44" rounded="lg" />
              <Skeleton className="h-3 w-56" rounded="lg" />
            </div>
          </div>

          <div>
            <Skeleton className="mb-2 h-4 w-36" rounded="lg" />
            <Skeleton className="h-11 w-full" rounded="xl" />
            <Skeleton className="mt-1 h-3 w-32" rounded="lg" />
          </div>

          <div>
            <Skeleton className="mb-2 h-4 w-44" rounded="lg" />
            <Skeleton className="h-11 w-full" rounded="xl" />
          </div>

          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-52" rounded="xl" />
            <Skeleton className="h-11 w-24" rounded="xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== AUTH LOADING SKELETON ===== */

export function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: PAGE_BG }}>
      <div className="animate-scale-in space-y-4 text-center">
        {/* Logo skeleton */}
        <div className="mx-auto flex justify-center">
          <Skeleton className="h-16 w-16" rounded="2xl" />
        </div>
        {/* Text skeletons */}
        <div className="space-y-2">
          <Skeleton className="mx-auto h-6 w-48" rounded="lg" />
          <Skeleton className="mx-auto h-4 w-64" rounded="lg" />
        </div>
      </div>
    </div>
  )
}

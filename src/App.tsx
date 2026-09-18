import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/Header'
import { PageTransition } from '@/components/PageTransition'
import { Login } from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { Dashboard } from '@/pages/Dashboard'
import { FilesPage } from '@/pages/Files'
import { ProjectDetails } from '@/pages/ProjectDetails'
import { NewProject } from '@/pages/NewProject'
import { EditProject } from '@/pages/EditProject'
import { Settings } from '@/pages/Settings'
import { Skeleton } from '@/components/Skeleton'

const PAGE_BG = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #eef2ff 100%)'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: PAGE_BG }}
      >
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-12 w-12" rounded="2xl" />
          <Skeleton className="mx-auto h-4 w-32" rounded="lg" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: PAGE_BG }}>
      <Header />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PageTransition>
              <ResetPassword />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fichiers"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition>
                  <FilesPage />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/creatives" element={<Navigate to="/fichiers" replace />} />
        <Route
          path="/project/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition>
                  <NewProject />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition>
                  <ProjectDetails />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition>
                  <EditProject />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition>
                  <Settings />
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

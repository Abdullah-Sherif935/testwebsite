import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';

// Layouts
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';

// Public Pages
import { Home } from './pages/Home';
import { Articles } from './pages/Articles/index';
import { ArticleDetail } from './pages/Articles/ArticleDetail';
import { SavedArticles } from './pages/Articles/SavedArticles';
import { Resources } from './pages/Resources';
import { About } from './pages/About';
import { Videos } from './pages/Videos';
import { NotFound } from './pages/NotFound';
import { Auth } from './pages/Auth/Auth';
import { Profile } from './pages/Profile/Profile';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminArticles } from './pages/admin/Articles';
import { AdminArticleForm } from './pages/admin/ArticleForm';
import { AdminVideos } from './pages/admin/Videos';
import { AdminResources } from './pages/admin/Resources';
import { AdminProjects } from './pages/admin/Projects';
import { AdminProjectForm } from './pages/admin/ProjectForm';
import { AdminProfile } from './pages/admin/Profile';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminMessages } from './pages/admin/Messages';
import { AdminComments } from './pages/admin/Comments';
import { AdminUsers } from './pages/admin/Users';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';

// Context & Protection
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

function App() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const isAr = i18n.language.startsWith('ar');
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const isAr = i18n.language.startsWith('ar');

  const publicRoutes = (
    <div dir={isAr ? 'rtl' : 'ltr'} lang={i18n.language}>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/saved-articles" element={<SavedArticles />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </div>
  );

  const adminRoutes = (
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} /> {/* Default admin route */}
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="articles/new" element={<AdminArticleForm />} />
                  <Route path="articles/edit/:id" element={<AdminArticleForm />} />
                  <Route path="videos" element={<AdminVideos />} />
                  <Route path="resources" element={<AdminResources />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="projects/new" element={<AdminProjectForm />} />
                  <Route path="projects/edit/:id" element={<AdminProjectForm />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="comments" element={<AdminComments />} />
                  {/* Default redirect to articles */}
                  <Route path="*" element={<AdminArticles />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AdminAuthProvider>
  );

  return (
    <AuthProvider>
      {isAdminPath ? adminRoutes : publicRoutes}
    </AuthProvider>
  );
}

export default App;

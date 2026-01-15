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
import { Resources } from './pages/Resources';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { Login } from './pages/admin/Login';
import { AdminArticles } from './pages/admin/Articles';
import { AdminArticleForm } from './pages/admin/ArticleForm';
import { AdminVideos } from './pages/admin/Videos';
import { AdminResources } from './pages/admin/Resources';
import { AdminProjects } from './pages/admin/Projects';
import { AdminProjectForm } from './pages/admin/ProjectForm';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';

// Context & Protection
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

function App() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  const publicRoutes = (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );

  const adminRoutes = (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="articles" element={<AdminArticles />} />
                <Route path="articles/new" element={<AdminArticleForm />} />
                <Route path="articles/edit/:id" element={<AdminArticleForm />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="resources" element={<AdminResources />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="projects/new" element={<AdminProjectForm />} />
                <Route path="projects/edit/:id" element={<AdminProjectForm />} />
                {/* Default redirect to articles */}
                <Route path="*" element={<AdminArticles />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );

  return (
    <AuthProvider>
      {isAdminPath ? adminRoutes : publicRoutes}
    </AuthProvider>
  );
}

export default App;

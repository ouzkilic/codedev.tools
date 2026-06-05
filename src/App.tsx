import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Analytics } from '@/components/layout/Analytics';
import { HomePage } from '@/pages/HomePage';
import { ToolPage } from '@/pages/ToolPage';

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/tool/:toolId" element={<ToolPage />} />
          <Route path="*" element={<div className="p-6">Page not found.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

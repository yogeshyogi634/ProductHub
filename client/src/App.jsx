import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import AuthGuard from './components/auth/AuthGuard';


import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PendingApproval from './pages/PendingApproval';
import EmailSignatureGenerator from './pages/EmailSignatureGenerator';

function App() {
  return (
    <Router>
      <StoreProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          } />
          <Route path="/admin" element={
            <AuthGuard>
              <Admin />
            </AuthGuard>
          } />
          <Route path="/email-signature-generator" element={
            <AuthGuard>
              <EmailSignatureGenerator />
            </AuthGuard>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';

console.log("API URL 👉", import.meta.env.VITE_API_URL);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />

          <Route path="/contacts" element={
            <PrivateRoute><Contacts /></PrivateRoute>
          } />

          <Route path="/templates" element={
            <PrivateRoute><Templates /></PrivateRoute>
          } />

          <Route path="/campaigns" element={
            <PrivateRoute><Campaigns /></PrivateRoute>
          } />

          <Route path="/analytics" element={
            <PrivateRoute><Analytics /></PrivateRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

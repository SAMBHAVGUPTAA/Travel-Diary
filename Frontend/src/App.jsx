import React from 'react'
import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Home/Home'
const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/'  element={<Root />} />
          <Route path='/dashboard'  element={<Home />} />
          <Route path='/login'  element={<Login />} />
          <Route path='/signup'  element={<SignUp />} />
        </Routes>
      </Router>
    </div>
  )
}

// Define the root component to handle the initial redirect
const Root = () => {
  // check if token exists in localstorage 
  const isAuthenticated = !!localStorage.getItem("token");

  //redirect to dashboard if authenticated, otherwise to login 
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
    ) : (
      <Navigate to="/login" />
  );
};
export default App

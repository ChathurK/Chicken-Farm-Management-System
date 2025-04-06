import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScreenSizeIndicator from './components/ScreenSizeIndicator';
import routes from './routes';

const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
      <ScreenSizeIndicator /> {/* Kept global */}
    </Router>
  );
};

export default App;
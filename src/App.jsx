import { Route, Routes } from "react-router-dom";

import './App.css';
import Header from './components/HeaderComponent';
import Home from './pages/Home';
import Restaurants from "./pages/Restaurants";


function App() {
  return (
    <>
      <Header />
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/Restaurants" element={<Restaurants />} />
        
      </Routes>
    </>
  );
}

export default App;

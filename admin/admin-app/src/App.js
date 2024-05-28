import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './adminDashboard';

function App() {
return(
  <Router>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
  </Router>
);

};

export default App;
 
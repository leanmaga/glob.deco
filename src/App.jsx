import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { About, Contact, Home } from "./pages";
import Footer from "./components/Footer";

const App = () => {
  return (
    <main>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/*"
            element={
              <>
                <Routes>
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </main>
  );
};

export default App;

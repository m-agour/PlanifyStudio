import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import { Fragment } from "react";
import { isLoggedIn } from "./services/helpers";
import Studio from "./pages/studio/studio";
import Result from "./pages/result/result";
import Footer from './components/footer/footer';


function App() {

  return (

    <Fragment>
      <BrowserRouter>
        <div>
          {/* {window.location.pathname !== "/" && <Header />} */}
        </div>
        <Routes>
          <Route path="/" element={<Studio />} />
          <Route path="/result" element={<Result/>} />
        </Routes>

        <div>
          {/* {window.location.pathname !== "/" && <Footer />} */}
        </div>

      </BrowserRouter>
    </Fragment>
  );
}
export default App;

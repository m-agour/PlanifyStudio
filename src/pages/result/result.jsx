import Header from "../../components/header/header";
import React, { Fragment } from "react";
import { Container } from "react-bootstrap";
import classes from "./result.module.css";
import Footer from "../../components/footer/footer";
import PlanifyDraw from '../../components/studio/planify-pixi';
import ImageDisplay from "../../components/imageDisplay/ImageDisplay";
import { useEffect, useState } from "react";


const App = () => { 

  // const [img1, setImg1] = useState(null);
  // const [img2, setImg2] = useState(null);
  let data = null

    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    JSON.parse(decodeURIComponent(state))
    if (state) {
      data = JSON.parse(decodeURIComponent(state));
      console.log(data);

    }



  return (
    <Fragment>
      <Header/>
    {/* <Header /> */}
    <div>
      <ImageDisplay
        image1={data.project_img}
        image1Title="Input Boundary"
        image2={data.design_img}
        image2Title="Generated Layout"
      />
    </div>
    <Footer />
    </Fragment>
  );
};

export default App;

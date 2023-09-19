import Header from "../../components/header/header";
import React from "react";
import classes from "./studio.module.css";
import PlanifyDraw from '../../components/studio/planify-pixi';

const Studio = function(){
  document.title = "Studio | Planify";

  return (
  <>
    <Header />
    
    <div className={classes.studio}>
      <PlanifyDraw style={{ marginTop: 0 , paddingBottom: 0}}/>
    </div>
    
  </>
);
  }
export default Studio;
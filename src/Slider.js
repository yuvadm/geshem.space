import React, { useState, useEffect, Component } from "react";
import RcSlider from "rc-slider";

function Slider(props) {
  const handleStyle = {
    height: 40,
    width: 40,
    border: 0,
    marginTop: -10,
    boxShadow: ".5px .5px 2px 1px rgba(0,0,0,.32)"
  };

  const railStyle = {
    height: 20,
    backgroundColor: "#3498db"
  };

  const trackStyle = {
    display: "none"
  };

  return (
    <RcSlider
      mix={0}
      max={props.playback ? 143 : 9}
      defaultValue={props.slider}
      handleStyle={handleStyle}
      railStyle={railStyle}
      trackStyle={trackStyle}
      onChange={val => props.setSlider(val)}
    />
  );
}

export default Slider;

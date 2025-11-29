import React from "react";
import "../styles/theme.css";
export default function Card({className,icon, main, sub}){
  return (
    <div className={"card " + (className||"")}>
      <div className="row" style={{alignItems:"center"}}>
        <div style={{width:56,height:56,borderRadius:12,background:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center", marginRight:12}}>
          {icon}
        </div>
        <div>
          <div className="big">{main}</div>
          <div className="kicker">{sub}</div>
        </div>
      </div>
    </div>
  );
}

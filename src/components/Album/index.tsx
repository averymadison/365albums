import React from "react";
import { FiMusic } from "react-icons/fi";
import "./album.css";

export interface Props {
  // Image to render
  src: string | null;
  alt?: string;
}

const Album = ({ src, alt }: Props) => (
  <div className="album">
    <div className="albumContent">
      {src ? <img src={src} alt={alt} /> : <FiMusic />}
    </div>
  </div>
);

export default Album;

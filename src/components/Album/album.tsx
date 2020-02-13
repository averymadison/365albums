import "./album.css";

import React from "react";
import classNames from "classnames";

export interface Props {
  src: string | null;
  alt?: string;
  isAlwaysSquare?: boolean;
}

const Album = ({ src, alt, isAlwaysSquare }: Props) => {
  const classname = classNames("album", { square: isAlwaysSquare });
  const albumSrc = src ? src : undefined;

  return (
    <div className={classname}>
      <div className="albumContent">
        <img src={albumSrc} alt={alt} />
      </div>
    </div>
  );
};

export default Album;

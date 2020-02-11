import './album.css';

import { FiMusic } from 'react-icons/fi';
import React from 'react';
import classNames from 'classnames';

export interface Props {
  src: string | null;
  alt?: string;
  isAlwaysSquare?: boolean;
}

const Album = ({ src, alt, isAlwaysSquare }: Props) => {
  const classname = classNames('album', { square: isAlwaysSquare });

  return (
    <div className={classname}>
      <div className="albumContent">
        {src ? <img src={src} alt={alt} /> : <FiMusic />}
      </div>
    </div>
  );
};

export default Album;

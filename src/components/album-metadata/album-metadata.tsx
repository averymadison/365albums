import './album-metadata.css';

import React from 'react';
import { format } from 'date-fns';

export interface Props {
  releaseDate: Date;
  tracks: number;
}

const AlbumMetadata = (props: Props) => {
  const { releaseDate, tracks } = props;

  return (
    <span className="albumDetails-meta">
      {releaseDate && (
        <span className="albumDetails-meta-releaseDate">
          {format(Date.parse(releaseDate.toString()), 'yyyy')}
        </span>
      )}
      {tracks > 0 && (
        <span className="albumDetails-meta-songs">
          {tracks === 1 ? `${tracks} song` : `${tracks} songs`}
        </span>
      )}
    </span>
  );
};

export default AlbumMetadata;

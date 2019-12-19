import React from "react";
import "./album-metadata.css";
import { format } from "date-fns";

export interface Props {
  releaseDate: Date;
  length: number;
  tracks: number;
}

const AlbumMetadata = (props: Props) => {
  const { releaseDate, tracks, length } = props;

  return (
    <span className="albumDetails-meta">
      {releaseDate && (
        <span className="albumDetails-meta-releaseDate">
          {format(Date.parse(releaseDate.toString()), "yyyy")}
        </span>
      )}
      {tracks > 0 && (
        <span className="albumDetails-meta-songs">
          {tracks === 1 ? `${tracks} song` : `${tracks} songs`}
        </span>
      )}
      {length > 0 && (
        <span className="albumDetails-meta-minutes">
          {length === 1 ? `${length} minute` : `${length} minutes`}
        </span>
      )}
    </span>
  );
};

export default AlbumMetadata;

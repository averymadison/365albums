import React from "react";
import "./album-details.css";
import { Source } from "../Chart";
import Album from "../Album";
import Firebase, { withFirebase } from "../Firebase";
import { FiTrash } from "react-icons/fi";
import { format } from "date-fns";
import AlbumMetadata from "../AlbumMetadata";

export interface Props {
  firebase: Firebase;
  chartId: string;
  title: string;
  artist: string;
  albumUrl: string;
  uri: string;
  releaseDate: Date;
  length: number;
  tracks: number;
  source: Source;
  day: Date;
}

const AlbumDetails = (props: Props) => {
  const {
    title,
    artist,
    albumUrl,
    uri,
    releaseDate,
    length,
    tracks,
    source,
    day
  } = props;

  const onDeleteAlbum = (day: Date) => {
    const { firebase, chartId } = props;
    const dateAsString = format(day, "yyyy-MM-dd");
    firebase
      .chart(chartId)
      .child(`albums/${dateAsString}`)
      .remove();
  };

  return (
    <div className="album-details">
      <div className="albumImage">
        <Album src={albumUrl} alt={title} />
      </div>
      <div className="albumDetails-content">
        <h2 className="albumDetails-title">{title}</h2>
        <div className="albumDetails-artist">{artist}</div>
        <AlbumMetadata
          releaseDate={releaseDate}
          tracks={tracks}
          length={length}
        />
      </div>
      <div className="albumDetails-buttons">
        {source && (
          <a
            className={`button button-fill button-large button-${source}`}
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`Listen on ${source.charAt(0).toUpperCase() + source.slice(1)}`}
          </a>
        )}
        <button
          className="button icon-button button-large"
          onClick={() => onDeleteAlbum(day)}
        >
          <FiTrash />
        </button>
      </div>
    </div>
  );
};

export default withFirebase(AlbumDetails);

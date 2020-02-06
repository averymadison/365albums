import React from 'react';
import './album-details.css';
import { Source } from '../Chart';
import Album from '../Album';
import Firebase, { withFirebase } from '../Firebase';
import { FiCheckCircle, FiCircle, FiTrash } from 'react-icons/fi';
import { format } from 'date-fns';
import AlbumMetadata from '../AlbumMetadata';

export interface Props {
  firebase: Firebase;
  chartId: string;
  title: string;
  artist: string;
  albumUrl: string;
  uri: string;
  releaseDate: Date;
  tracks: number;
  source: Source;
  day: Date;
  isEditable: boolean;
  isListened: boolean;
}

const AlbumDetails = (props: Props) => {
  const {
    title,
    artist,
    albumUrl,
    uri,
    releaseDate,
    tracks,
    source,
    day,
    isEditable,
    isListened
  } = props;

  const onToggleListenedState = (day: Date) => {
    const { firebase, chartId, isListened } = props;
    const dateAsString = format(day, 'yyyy-MM-dd');
    firebase
      .chart(chartId)
      .child(`albums/${dateAsString}`)
      .update({
        isListened: !isListened
      });
  };

  const onDeleteAlbum = (day: Date) => {
    const { firebase, chartId } = props;
    const dateAsString = format(day, 'yyyy-MM-dd');
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
        <AlbumMetadata releaseDate={releaseDate} tracks={tracks} />
      </div>
      <div className="albumDetails-buttons">
        {isEditable && (
          <button
            className="button icon-button button-large"
            onClick={() => onToggleListenedState(day)}
          >
            {isListened ? <FiCheckCircle /> : <FiCircle />}
          </button>
        )}
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
        {isEditable && (
          <button
            className="button icon-button button-large"
            onClick={() => onDeleteAlbum(day)}
          >
            <FiTrash />
          </button>
        )}
      </div>
    </div>
  );
};

export default withFirebase(AlbumDetails);

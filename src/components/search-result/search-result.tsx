import "./search-result.css";

import { AlbumMetadata } from "..";
import React from "react";

export interface Props {
  imageUrl: string;
  title: string;
  artist: string;
  releaseDate: Date;
  tracks?: number;
  onClick: () => void;
}

const SearchResult = (props: Props) => {
  const { releaseDate, tracks, title, artist, imageUrl, onClick } = props;

  return (
    <button onClick={onClick} className="search-result">
      <img
        src={imageUrl}
        alt={`${title} cover art`}
        className="search-result-image"
      />
      <span className="search-result-contents">
        <strong className="search-result-album">{title}</strong>
        <span className="search-result-artist">{artist}</span>
        <AlbumMetadata releaseDate={releaseDate} tracks={tracks!} />
      </span>
    </button>
  );
};

export default SearchResult;

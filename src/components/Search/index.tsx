import React from "react";
import Firebase, { withFirebase } from "../Firebase";
import { format, parse } from "date-fns";
import "./search.css";
import SearchResult from "../SearchResult";
import { Source } from "../Chart";

interface Props {
  firebase: Firebase;
  chartId: string;
  selectedDay: Date;
}

interface State {
  searchQuery: string;
  searchResults: [] | null;
  isSearching: boolean;
  source: Source;
}

const INITIAL_STATE = {
  searchQuery: "",
  searchResults: null,
  isSearching: false,
  source: "spotify" as Source
};

class SearchBase extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...INITIAL_STATE
    };
  }

  onCreateAlbum = (
    source: string,
    uri: string,
    title: string,
    artist: string,
    releaseDate: Date,
    artworkUrl: string,
    tracks: number,
    length: number
  ) => {
    const { firebase, chartId, selectedDay } = this.props;

    const dateAsString = format(selectedDay!, "yyyy-MM-dd");

    firebase
      .chart(chartId)
      .child(`albums/${dateAsString}`)
      .update({
        uri: uri,
        source: source,
        title: title,
        artist: artist,
        releaseDate: releaseDate,
        artwork: artworkUrl,
        tracks: tracks,
        length: length
      });

    firebase
      .chart(chartId)
      .update({ updatedAt: firebase.serverValue.TIMESTAMP });
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  onToggleSource = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
    this.setState({ searchResults: INITIAL_STATE.searchResults });
  };

  onSearch = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { searchQuery, source } = this.state;
    this.setState({ isSearching: true });

    fetch(
      `https://us-central1-daily-album.cloudfunctions.net/search?q=${searchQuery}&type=${source}`
    )
      .then(res => res.json())
      .then(result => {
        this.setState({ searchResults: result, isSearching: false });
      })
      .catch(rejected => {
        this.setState({ isSearching: false });
      });

    event.preventDefault();
  };

  // Bandcamp uses an underscore and number at the end of the image URL to
  // denote different resolutions of image. _5 is higher quality than _7 but
  // the bandcamp-scraper API only returns _7.
  getHigherResBandcampAlbumArt = (imageUrl: string) => {
    return imageUrl.replace("_7", "_5");
  };

  renderSearchResults = (searchResults: []) => {
    const { source } = this.state;

    if (!searchResults) return;

    return !searchResults.length ? (
      <div>No results</div>
    ) : (
      <div className="search-results">
        {source === "bandcamp"
          ? searchResults.map((album: any, i) => (
              <SearchResult
                key={i}
                onClick={() => {
                  this.onCreateAlbum(
                    "bandcamp",
                    album.url,
                    album.name,
                    album.artist,
                    parse(album.releaseDate, "dd MMMM yyyy", new Date()),
                    this.getHigherResBandcampAlbumArt(album.imageUrl),
                    album.numTracks,
                    album.numMinutes
                  );
                  this.setState({ ...INITIAL_STATE });
                }}
                artist={album.artist}
                title={album.name}
                imageUrl={album.imageUrl}
                tracks={album.numTracks}
                length={album.numMinutes}
                releaseDate={parse(
                  album.releaseDate,
                  "dd MMMM yyyy",
                  new Date()
                )}
              />
            ))
          : source === "spotify"
          ? searchResults.map((album: any, i) => (
              <SearchResult
                key={i}
                onClick={() => {
                  this.onCreateAlbum(
                    "spotify",
                    album.external_urls.spotify,
                    album.name,
                    album.artists.map((artist: any) => artist.name).join(", "),
                    new Date(album.release_date),
                    album.images[0] && album.images[0].url,
                    album.total_tracks,
                    90
                  );
                  this.setState({ ...INITIAL_STATE });
                }}
                artist={album.artists
                  .map((artist: any) => artist.name)
                  .join(", ")}
                title={album.name}
                imageUrl={album.images[1] && album.images[1].url}
                tracks={album.total_tracks}
                releaseDate={new Date(album.release_date)}
              />
            ))
          : source === "discogs"
          ? searchResults.map((album: any, i) => (
              <SearchResult
                key={i}
                onClick={() => {
                  this.onCreateAlbum(
                    "discogs",
                    album.resource_url,
                    album.title.split(" - ")[1],
                    album.title.split(" - ")[0],
                    new Date(album.year),
                    album.cover_image,
                    12,
                    90
                  );
                  this.setState({ ...INITIAL_STATE });
                }}
                artist={album.title.split(" - ")[0]}
                title={album.title.split(" - ")[1]}
                imageUrl={album.cover_image}
                releaseDate={new Date(album.year)}
              />
            ))
          : null}
      </div>
    );
  };

  render() {
    const { selectedDay } = this.props;
    const { searchQuery, searchResults, isSearching, source } = this.state;

    if (!selectedDay) return null;

    return (
      <div className="search-wrapper">
        <form
          className="search-form"
          onSubmit={this.onSearch}
          autoComplete="off"
        >
          <div className="radio-bar">
            <label>
              <input
                type="radio"
                name="source"
                value="spotify"
                checked={source === "spotify"}
                onChange={this.onToggleSource}
              />
              <div className="radio-button">Spotify</div>
            </label>
            <label>
              <input
                type="radio"
                name="source"
                value="bandcamp"
                checked={source === "bandcamp"}
                onChange={this.onToggleSource}
              />
              <div className="radio-button">Bandcamp</div>
            </label>
            <label>
              <input
                type="radio"
                name="source"
                value="discogs"
                checked={source === "discogs"}
                onChange={this.onToggleSource}
              />
              <div className="radio-button">Discogs</div>
            </label>
          </div>
          <input
            name="searchQuery"
            type="search"
            placeholder={`Search ${source}…`}
            value={searchQuery}
            onChange={this.onChange}
            className="search"
            autoFocus
            ref={input => input && input.focus()}
            disabled={isSearching}
          />
        </form>
        {isSearching && `Searching ${source}...`}
        {searchResults &&
          searchResults.length &&
          this.renderSearchResults(searchResults)}
      </div>
    );
  }
}

const Search = withFirebase(SearchBase);

export default Search;

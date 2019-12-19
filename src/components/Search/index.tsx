import React from "react";
import Firebase, { withFirebase } from "../Firebase";
import { format, parse } from "date-fns";
import "./search.css";
import AlbumMetadata from "../AlbumMetadata";
import { Source } from "../Chart";

interface Props {
  firebase: Firebase;
  chartId: string;
  selectedDay: Date;
}

interface State {
  searchQuery: string;
  bandcampSearchResults: [] | null;
  spotifySearchResults: {} | null;
  isSearching: boolean;
  source: Source;
}

const INITIAL_STATE = {
  searchQuery: "",
  bandcampSearchResults: null,
  spotifySearchResults: null,
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

  onSearch = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { searchQuery, source } = this.state;
    this.setState({ isSearching: true });

    fetch(
      `https://us-central1-daily-album.cloudfunctions.net/search?q=${searchQuery}&type=${source}`
    )
      .then(res => res.json())
      .then(result => {
        source === "spotify" && this.setState({ spotifySearchResults: result });
        source === "bandcamp" &&
          this.setState({ bandcampSearchResults: result });
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

  renderBandcampSearchResults = (searchResults: []) => {
    if (!searchResults) return;

    const filteredResults = searchResults.filter(
      (item: any) => item.type === "album"
    ) as [];

    return !filteredResults.length ? (
      <div>No results</div>
    ) : (
      <div className="search-results">
        {filteredResults.map((album: any, i) => (
          <button
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
            className="search-result"
          >
            <img
              src={album.imageUrl}
              alt={`${album.name} cover art`}
              className="search-result-image"
            />
            <span className="search-result-contents">
              <span className="search-result-album">{album.name}</span>
              <span className="search-result-artist">{album.artist}</span>
              <AlbumMetadata
                releaseDate={parse(
                  album.releaseDate,
                  "dd MMMM yyyy",
                  new Date()
                )}
                tracks={album.numTracks}
                length={album.numMinutes}
              />
            </span>
          </button>
        ))}
      </div>
    );
  };

  renderSpotifySearchResults = (searchResults: {}) => {
    if (!searchResults) return;

    // const filteredResults = Object.keys(searchResults).filter(
    //   (item: any) => item.type === "album"
    // );

    // !filteredResults.length ? (
    //   <div>No results</div>
    // ) : (
    console.log(searchResults);
    return (
      <div className="search-results">
        {Object.keys(searchResults).map((album: any, i) => (
          <button key={i} onClick={() => null} className="search-result">
            {console.log(album)}
            {/* <img
              src={album.items[i].album.images[0].url}
              alt={`${album.name} cover art`}
              className="search-result-image"
            />
            <span className="search-result-contents">
              <span className="search-result-album">{album.name}</span>
              <span className="search-result-artist">{album.artist}</span>
              <AlbumMetadata
                releaseDate={new Date()}
                tracks={album.numTracks}
                length={album.numMinutes}
              />
            </span> */}
          </button>
        ))}
      </div>
    );
  };

  render() {
    const { selectedDay } = this.props;
    const {
      searchQuery,
      bandcampSearchResults,
      spotifySearchResults,
      isSearching,
      source
    } = this.state;

    if (!selectedDay) return null;

    return (
      <div className="search-wrapper">
        <div>Add an album for {format(selectedDay, "MMM d")}</div>
        <form onSubmit={this.onSearch} autoComplete="off">
          <label>
            <input
              type="radio"
              name="source"
              value="spotify"
              checked={source === "spotify"}
              onChange={this.onChange}
            />
            Spotify
          </label>
          <label>
            <input
              type="radio"
              name="source"
              value="bandcamp"
              checked={source === "bandcamp"}
              onChange={this.onChange}
            />
            Bandcamp
          </label>
          <input
            name="searchQuery"
            type="search"
            placeholder={`Search ${source}`}
            value={searchQuery}
            onChange={this.onChange}
            className="search"
            autoFocus
            ref={input => input && input.focus()}
            disabled={isSearching}
          />
        </form>
        {isSearching && `Searching ${source}...`}
        {bandcampSearchResults &&
          bandcampSearchResults.length &&
          source === "bandcamp" &&
          this.renderBandcampSearchResults(bandcampSearchResults)}
        {spotifySearchResults &&
          source === "spotify" &&
          this.renderSpotifySearchResults(spotifySearchResults)}
      </div>
    );
  }
}

const Search = withFirebase(SearchBase);

export default Search;

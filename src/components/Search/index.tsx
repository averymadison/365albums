import React from "react";
import Firebase, { withFirebase } from "../Firebase";
import { format } from "date-fns";
import "./search.css";

interface Props {
  firebase: Firebase;
  chartId: string;
  selectedDay: Date;
}

interface State {
  searchQuery: string;
  searchResults: [] | null;
  isSearching: boolean;
}

const INITIAL_STATE = {
  searchQuery: "",
  searchResults: null,
  isSearching: false
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

  onSearchBandcamp = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { searchQuery } = this.state;
    this.setState({ isSearching: true });

    fetch(
      `https://us-central1-daily-album.cloudfunctions.net/searchBandcamp?q=${searchQuery}`
    )
      .then(res => res.json())
      .then(result =>
        this.setState({ searchResults: result, isSearching: false })
      );

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
                new Date(album.releaseDate),
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
              <span className="search-result-release-date">
                {album.releaseDate}
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  };

  render() {
    const { selectedDay } = this.props;
    const { searchQuery, searchResults, isSearching } = this.state;

    if (!selectedDay) return null;

    return (
      <div className="search-wrapper">
        <div>Add an album for {format(selectedDay, "MMM d")}</div>
        <form onSubmit={this.onSearchBandcamp}>
          <input
            name="searchQuery"
            type="text"
            placeholder="Search Bandcamp"
            value={searchQuery}
            onChange={this.onChange}
            className="search"
            disabled={isSearching}
          />
        </form>
        {isSearching && "Searching Bandcamp..."}
        {searchResults &&
          searchResults.length &&
          this.renderBandcampSearchResults(searchResults)}
      </div>
    );
  }
}

const Search = withFirebase(SearchBase);

export default Search;

import React from "react";
import Firebase, { withFirebase } from "../Firebase";
import { format, parse } from "date-fns";
import "./search.css";
import SearchResult from "../SearchResult";
import { Source } from "../Chart";
import Spinner from "../Spinner";
import Empty from "../Empty";

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
    thumbUrl: string,
    artworkUrl: string,
    tracks: number
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
        thumb: thumbUrl,
        artwork: artworkUrl,
        tracks: tracks
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

    return !searchResults.length ? (
      <Empty
        title="No results"
        description="Check your spelling and try again."
      />
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
                    album.imageUrl,
                    this.getHigherResBandcampAlbumArt(album.imageUrl),
                    album.numTracks
                  );
                  this.setState({ ...INITIAL_STATE });
                }}
                artist={album.artist}
                title={album.name}
                imageUrl={album.imageUrl}
                tracks={album.numTracks}
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
                    album.uri,
                    album.name,
                    album.artists.map((artist: any) => artist.name).join(", "),
                    new Date(album.release_date),
                    album.images[1] && album.images[1].url, // 300px image
                    album.images[0] && album.images[0].url, // 640px image
                    album.total_tracks
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
                    album.thumb,
                    album.cover_image,
                    99999
                  );
                  this.setState({ ...INITIAL_STATE });
                }}
                artist={album.title.split(" - ")[0]}
                title={album.title.split(" - ")[1]}
                imageUrl={album.thumb}
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
          <div className="search-input-wrapper">
            <input
              name="searchQuery"
              type="search"
              placeholder={`Search ${source}…`}
              value={searchQuery}
              onChange={this.onChange}
              className="search"
              disabled={isSearching}
            />
            {isSearching && (
              <div className="spinner-wrapper">
                <Spinner />
              </div>
            )}
          </div>
        </form>
        {searchResults && this.renderSearchResults(searchResults)}
      </div>
    );
  }
}

const Search = withFirebase(SearchBase);

export default Search;

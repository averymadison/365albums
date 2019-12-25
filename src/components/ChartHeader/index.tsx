import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import Firebase, { withFirebase } from "../Firebase";
import "./chart-header.css";

interface Props {
  firebase: Firebase;
  chartId: string;
}

interface State {
  isEditing: boolean;
  title: string;
  updatedAt: string | null;
}

const INITIAL_STATE = {
  isEditing: false,
  title: "",
  updatedAt: null
};

class ChartHeaderBase extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...INITIAL_STATE
    };
  }

  componentDidMount() {
    const { firebase, chartId } = this.props;

    firebase.chart(chartId).on("value", snapshot => {
      const chart = snapshot.val();

      if (chart) {
        this.setState({
          title: chart.title ? chart.title : "",
          updatedAt: chart.updatedAt ? chart.updatedAt : null
        });
      } else {
        this.setState({ ...INITIAL_STATE });
      }
    });
  }

  onSaveTitle = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { firebase, chartId } = this.props;
    const { title } = this.state;

    firebase
      .chart(chartId)
      .update({ title, updatedAt: firebase.serverValue.TIMESTAMP });

    this.onToggleEditMode();
    event.preventDefault();
  };

  onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  onToggleEditMode = () => {
    const { isEditing } = this.state;
    this.setState({ isEditing: !isEditing });
  };

  render() {
    const { chartId } = this.props;
    const { isEditing, title, updatedAt } = this.state;
    const readableDate = formatDistanceToNow(new Date(updatedAt!));

    return (
      <div className="chart-header">
        {!isEditing ? (
          <h1 onClick={this.onToggleEditMode} className="chart-title">
            {title ? title : "Add a title…"}
          </h1>
        ) : (
          <form onSubmit={this.onSaveTitle}>
            <input
              name="title"
              type="text"
              placeholder="Add a title…"
              value={title}
              onChange={this.onChange}
              maxLength={32}
              autoFocus
              className="chart-title is-editing"
            />
            <button type="submit" className="button">
              Save
            </button>
          </form>
        )}
        <div>{updatedAt && `Last edited ${readableDate} ago`}</div>
        <Link to={`/chart/${chartId}`} className="button">
          Share
        </Link>
      </div>
    );
  }
}

const ChartHeader = withFirebase(ChartHeaderBase);

export default ChartHeader;

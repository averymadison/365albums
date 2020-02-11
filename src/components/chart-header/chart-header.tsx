import './chart-header.css';

import Firebase, { withFirebase } from '../firebase';
import { format, formatDistanceToNow } from 'date-fns';

import React from 'react';

interface Props {
  firebase: Firebase;
  chartId: string;
  isEditable: boolean;
}

interface State {
  isEditing: boolean;
  title: string;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
}

const INITIAL_STATE = {
  isEditing: false,
  title: '',
  description: '',
  createdAt: null,
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

    firebase.chart(chartId).on('value', snapshot => {
      const chart = snapshot.val();

      if (chart) {
        this.setState({
          title: chart.title ? chart.title : '',
          description: chart.description ? chart.description : '',
          createdAt: chart.createdAt ? chart.createdAt : null,
          updatedAt: chart.updatedAt ? chart.updatedAt : null
        });
      } else {
        this.setState({ ...INITIAL_STATE });
      }
    });
  }

  onSave = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { firebase, chartId } = this.props;
    const { title, description } = this.state;

    firebase.chart(chartId).update({
      title,
      description,
      updatedAt: firebase.serverValue.TIMESTAMP
    });

    this.onToggleEditMode();
    event.preventDefault();
  };

  onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  onToggleEditMode = () => {
    const { isEditable } = this.props;
    const { isEditing } = this.state;

    isEditable && this.setState({ isEditing: !isEditing });
  };

  render() {
    const { isEditing, title, description, updatedAt, createdAt } = this.state;
    const updatedAtHumanReadable = formatDistanceToNow(new Date(updatedAt!));
    const createdAtHumanReadable = format(new Date(createdAt!), 'MMM d, yyyy');

    return (
      <div className="chart-header">
        {!isEditing ? (
          <React.Fragment>
            <h1 onClick={this.onToggleEditMode} className="chart-title">
              {title ? title : 'Add a title…'}
            </h1>
            {description && (
              <p onClick={this.onToggleEditMode} className="chart-description">
                {description}
              </p>
            )}
          </React.Fragment>
        ) : (
          <form onSubmit={this.onSave}>
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
            <textarea
              name="description"
              placeholder="Add a description…"
              value={description}
              onChange={this.onChange}
              maxLength={120}
              className="chart-description is-editing"
            />
            <button type="submit" className="button">
              Save
            </button>
          </form>
        )}
        <div className="chart-header-meta">
          {createdAt && <span>{`Created ${createdAtHumanReadable}`}</span>}
          {updatedAt && (
            <span>{`Last edited ${updatedAtHumanReadable} ago`}</span>
          )}
        </div>
      </div>
    );
  }
}

const ChartHeader = withFirebase(ChartHeaderBase);

export default ChartHeader;

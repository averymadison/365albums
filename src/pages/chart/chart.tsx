import { Chart, Empty, Spinner } from '../../components/';
import Firebase, { withFirebase } from '../../components/firebase';

import React from 'react';
import { RouteComponentProps } from 'react-router';

interface Props {
  firebase: Firebase;
}

interface State {
  isLoading: boolean;
  activeUserId: string | null;
  activeChartId: string | null;
}

type RouteParams = {
  id: string;
};

class ChartPage extends React.Component<
  Props & RouteComponentProps<RouteParams>,
  State
> {
  constructor(props: Props & RouteComponentProps<RouteParams>) {
    super(props);

    this.state = {
      isLoading: true,
      activeUserId: null,
      activeChartId: this.props.match.params.id
    };
  }

  componentDidMount() {
    const { firebase } = this.props;

    this.setState({
      activeChartId: this.props.match.params.id
    });

    firebase.auth.onAuthStateChanged(async currentUser => {
      if (currentUser) {
        await this.setState({
          activeUserId: currentUser.uid,
          isLoading: false
        });
      }
    });
  }

  render() {
    const { activeChartId, isLoading, activeUserId } = this.state;

    return isLoading ? (
      <Spinner />
    ) : !activeChartId ? (
      <Empty title="No chart found" />
    ) : (
      <Chart chartId={activeChartId} activeUserId={activeUserId} />
    );
  }
}

export default withFirebase(ChartPage);

import React from "react";
import { RouteComponentProps } from "react-router";
import Chart from "../../components/Chart";
import Firebase, { withFirebase } from "../../components/Firebase";
import Spinner from "../../components/Spinner";

interface Props {
  firebase: Firebase;
}

interface State {
  isLoading: boolean;
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
      activeChartId: this.props.match.params.id
    };
  }

  componentDidMount() {
    this.setState({
      activeChartId: this.props.match.params.id,
      isLoading: false
    });
  }

  render() {
    const { activeChartId, isLoading } = this.state;

    return isLoading ? (
      <Spinner />
    ) : !activeChartId ? (
      <div>No chart found</div>
    ) : (
      <Chart chartId={activeChartId} />
    );
  }
}

export default withFirebase(ChartPage);

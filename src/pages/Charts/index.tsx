import React from "react";
import Firebase, { withFirebase } from "../../components/Firebase";
import { Link } from "react-router-dom";

interface Props {
  firebase: Firebase;
}

interface State {
  loading: boolean;
  charts: any;
}

const INITIAL_STATE = {
  loading: false,
  charts: []
};

class Charts extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.charts().on("value", (snapshot: any) => {
      const chartsObject = snapshot.val();

      const chartsList = Object.keys(chartsObject).map(key => ({
        ...chartsObject[key],
        id: key
      }));

      this.setState({
        charts: chartsList,
        loading: false
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.charts().off();
  }

  render() {
    const { charts, loading } = this.state;

    return (
      <div>
        <h1>Charts</h1>
        {loading && <div>Loading...</div>}
        <ChartList charts={charts} />
      </div>
    );
  }
}

const ChartList = ({ charts }: any) => (
  <ul>
    {charts.map((chart: any) => (
      <li key={chart.id}>
        <Link to={`chart/${chart.id}`}>{chart.title}</Link>
      </li>
    ))}
  </ul>
);

export default withFirebase(Charts);

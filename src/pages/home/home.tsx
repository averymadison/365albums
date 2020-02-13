import { AuthUserContext, withPermissions } from "../../components/session";
import { Chart, Spinner } from "../../components";

import Firebase from "../../components/firebase";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { compose } from "recompose";

interface Props extends RouteComponentProps<{}> {
  firebase: Firebase;
}

interface State {
  isLoading: boolean;
  activeUserId: string | null;
  activeChartId: string | null;
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
}

const INITIAL_STATE = {
  isLoading: true,
  activeUserId: null,
  activeChartId: null,
  fromMonth: 1,
  fromYear: 2020,
  toMonth: 12,
  toYear: 2020
};

class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...INITIAL_STATE
    };
  }

  componentDidMount() {
    const { firebase } = this.props;

    firebase.auth.onAuthStateChanged(async currentUser => {
      if (currentUser) {
        this.setState({
          activeUserId: currentUser.uid
        });

        await firebase.db
          .ref(`users/${this.state.activeUserId}/primaryChart`)
          .on("value", snapshot => {
            const primaryChartId = snapshot.val();

            this.setState({
              activeChartId: primaryChartId,
              isLoading: false
            });
          });
      }
    });
  }

  onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  onCreateChart = (event: any, authUser: any) => {
    const { firebase } = this.props;
    const { fromMonth, fromYear, toMonth, toYear } = this.state;

    const from = `${fromYear}-${fromMonth}`;
    const to = `${toYear}-${toMonth}`;

    const newChartKey = firebase.charts().push({
      createdBy: authUser.uid,
      createdAt: firebase.serverValue.TIMESTAMP,
      updatedAt: firebase.serverValue.TIMESTAMP,
      owner: authUser.uid,
      title: "Untitled",
      albums: {},
      fromMonth: from,
      toMonth: to
    }).key;

    firebase.user(authUser.uid).update({
      primaryChart: newChartKey
    });

    event.preventDefault();
  };

  render() {
    const { activeUserId } = this.state;
    const {
      activeChartId,
      fromMonth,
      fromYear,
      toMonth,
      toYear,
      isLoading
    } = this.state;

    return isLoading ? (
      <Spinner />
    ) : !activeChartId ? (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h2>Create your first chart</h2>
            <form onSubmit={event => this.onCreateChart(event, authUser)}>
              <label>From</label>
              <select
                name="fromMonth"
                value={fromMonth}
                onChange={this.onChange}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select name="fromYear" value={fromYear} onChange={this.onChange}>
                <option value="2015">2015</option>
                <option value="2016">2016</option>
                <option value="2017">2017</option>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
              <label>To</label>
              <select name="toMonth" value={toMonth} onChange={this.onChange}>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select name="toYear" value={toYear} onChange={this.onChange}>
                <option value="2015">2015</option>
                <option value="2016">2016</option>
                <option value="2017">2017</option>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
              <button className="button" type="submit">
                Create chart
              </button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    ) : (
      <Chart chartId={activeChartId} activeUserId={activeUserId} />
    );
  }
}

const condition = (authUser: any) => !!authUser;

export default compose(withPermissions(condition))(Home as any);

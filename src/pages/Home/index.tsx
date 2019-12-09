import React from 'react';
import { compose } from 'recompose';
import {
  withEmailVerification,
  withPermissions
} from '../../components/Session';
import Chart from '../../components/Chart';
import Firebase from '../../components/Firebase';

interface Props {
  firebase: Firebase;
}

interface State {
  activeChartId: string;
}

class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeChartId: '-LvcieNl76DuwPQtuy4v'
    };
  }

  // componentDidMount() {
  //   this.props.firebase.db
  //     .ref('users/rSQ41HpnxPT3oumxzhAPtjG51Gj2/primaryChart')
  //     .on('value', snapshot => {
  //       const primaryChartId = snapshot.val();

  //       this.setState({
  //         activeChartId: primaryChartId
  //       });
  //     });
  // }

  render() {
    const { activeChartId } = this.state;

    return <Chart chartId={activeChartId} />;
  }
}

const condition = (authUser: any) => !!authUser;

export default compose(
  withEmailVerification,
  withPermissions(condition)
)(Home as any);

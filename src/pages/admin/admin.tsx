import * as ROLES from "../../constants/roles";

import Firebase, { withFirebase } from "../../components/firebase";

import React from "react";
import { compose } from "recompose";
import { withPermissions } from "../../components/session";

interface Props {
  firebase: Firebase;
}

interface State {
  loading: boolean;
  users: any;
}

const INITIAL_STATE = {
  loading: false,
  users: []
};

class Admin extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on("value", (snapshot: any) => {
      const usersObject = snapshot.val();

      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key
      }));

      this.setState({
        users: usersList,
        loading: false
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    const { users, loading } = this.state;

    return (
      <div>
        <h1>Admin</h1>
        {loading && <div>Loading...</div>}
        <UserList users={users} />
      </div>
    );
  }
}

const UserList = ({ users }: any) => (
  <ul>
    {users.map((user: any) => (
      <li key={user.uid}>
        <span>
          <strong>ID:</strong> {user.uid}
        </span>
        <span>
          <strong>Email:</strong> {user.email}
        </span>
        <span>
          <strong>Username:</strong> {user.username}
        </span>
      </li>
    ))}
  </ul>
);

const condition = (authUser: any) => authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(withPermissions(condition), withFirebase)(Admin as any);

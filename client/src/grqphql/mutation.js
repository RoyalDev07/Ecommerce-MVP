import gql from "graphql-tag";
export const GET_TOKEN = gql`
  mutation($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;

export const VERIFY_TOKEN = gql`
  mutation($token: String!) {
    verifyToken(token: $token) {
      payload
    }
  }
`;

export const CREATE_USER = gql`
  mutation($username: String, $role: String, $password: String!) {
    createUser(username: $username, role: $role, password: $password) {
      user {
        username
        role
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation($username: String!, $role: String!, $password: String!, $id: Int!) {
    createUser(username: $username, role: $role, password: $password, id: $id) {
      user {
        username
        role
      }
    }
  }
`;

export const CREATE_ENTRY = gql`
  mutation($user: String!, $date: Date!, $distance: Int!, $time: Int!) {
    createEntry(user: $user, date: $date, distance: $distance, time: $time) {
      entry {
        user {
          username
        }
        date
        distance
        time
      }
    }
  }
`;

/*
  ID:Null => CreateEntry
  Otherwise => UpdateEntry
*/
export const UPDATE_ENTRY = gql`
  mutation($date: Date!, $distance: Int!, $time: Int!, $id: Int!) {
    createEntry(date: $date, distance: $distance, time: $time, id: $id) {
      entry {
        date
        distance
        time
      }
    }
  }
`;

export const DELETE_ENTRY = gql`
  mutation($id: Int) {
    deleteEntry(id: $id) {
      ok
    }
  }
`;

import gql from "graphql-tag";

export const CURRENT_USER = gql`
  query {
    currentUser {
      username
      password
      id
      role
    }
  }
`;
export const CURRENT_USER1 = gql`
  query CurrentUser {
    currentUser {
      username
      password
      id
      role
    }
  }
`;

export const FILTER_ENTRY = gql`
  query filterEntry($fromDate: Date, $toDate: Date) {
    allEntries(fromDate: $fromDate, toDate: $toDate) {
      edges {
        node {
          id
          distance
          time
          date
          user {
            username
          }
          pk
        }
      }
    }
  }
`;

export const WEEKLY_REPORT = gql`
  query {
    weeklyReport {
      totalDistance
      totalTime
    }
  }
`;

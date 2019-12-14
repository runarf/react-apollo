import React, { useEffect } from "react";
import Link from "./Link";
import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import {
  useLocation,
  useParams,
  useHistory
} from "react-router-dom";
import { LINKS_PER_PAGE } from "../constants";
const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

export const FEED_QUERY = gql`
  query FeedQuery(
    $first: Int
    $skip: Int
    $orderBy: LinkOrderByInput
  ) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`;

const LinkList = props => {
  const {
    loading,
    error,
    data,
    subscribeToMore
  } = useQuery(FEED_QUERY, {
    variables: getQueryVariables()
  });

  const location = useLocation();
  const params = useParams();
  const history = useHistory();

  const subscribeToNewVotes = subscribeToMoreVotes => {
    subscribeToMoreVotes({
      document: NEW_VOTES_SUBSCRIPTION
    });
  };

  useEffect(() => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data.newLink) return prev;
        const newLink = subscriptionData.data.newLink;
        const exists = prev.feed.links.find(
          ({ id }) => id === newLink.id
        );
        if (exists) return prev;

        const newState = {
          ...prev,
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        };

        return newState;
      }
    });
  }, []);

  if (loading) return <div>Fetching</div>;
  if (error) return <div>Error</div>;

  const linksToRender = data.feed.links;

  const getQueryVariables = () => {
    const isNewPage = location.pathname.includes("new");
    const page = parseInt(params.page, 10);

    const skip = isNewPage
      ? (page - 1) * LINKS_PER_PAGE
      : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? "createdAt_DESC" : null;
    return { first, skip, orderBy };
  };

  const getLinksToRender = data => {
    const isNewPage = location.pathname.includes("new");
    if (isNewPage) return data.feed.links;
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort(
      (l1, l2) => l2.votes.length - l1.votes.length
    );
    return rankedLinks;
  };

  const nextPage = data => {
    const page = parseInt(params.page, 10);
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      history.push("/new/${nextPage}");
    }
  };

  const previousPage = () => {
    const page = parseInt(params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      history.push("/new/${previousPage}");
    }
  };

  return (
    <div>
      {linksToRender.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </div>
  );
};

export default LinkList;

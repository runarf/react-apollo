import React, { useState, useEffect } from 'react';
import Link from './Link';
import { useLazyQuery } from 'react-apollo';
import gql from 'graphql-tag';

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
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
    }
  }
`;

const Search = () => {
  const [links, setLinks] = useState([]);
  const [filter, setFilter] = useState('');

  const [getLinks, {  data }] = useLazyQuery(FEED_SEARCH_QUERY);

  useEffect(() => {
    if (data && data.feed && data.feed.links.length > 0) {
      setLinks(data.feed.links);
    }
  }, [data]);

  return (
    <div>
      <div>
        Search
        <input type="text" onChange={event => setFilter(event.target.value)} />
        <button
          onClick={() => {
            getLinks({ variables: { filter } });
          }}
        >
          OK
        </button>
      </div>
      {links.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </div>
  );
};

export default Search;

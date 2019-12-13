import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { FEED_QUERY } from './LinkList';

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

const CreateLink = props => {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const [addPost] = useMutation(POST_MUTATION, {
    onCompleted: () => {
      props.history.push('/');
    },
    update: (store, { data: { post } }) => {
      const data = store.readQuery({ query: FEED_QUERY });
      data.feed.links.unshift(post);
      store.writeQuery({
        query: FEED_QUERY,
        data
      });
    }
  });

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={event => setDescription(event.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={event => setUrl(event.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>
      <button
        onClick={() =>
          addPost({
            variables: { description, url }
          })
        }
      >
        Submit
      </button>
    </div>
  );
};

export default withRouter(CreateLink);

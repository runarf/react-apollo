function newLinkSubscribe(parent, args, context, info) {
  console.log('Subscribing to new link');
  return context.prisma.$subscribe.link({ mutation_in: ['CREATED'] }).node();
}

const newLink = {
  subscribe: newLinkSubscribe,
  resolve: payload => {
    console.log('resolving link subscription');
    return payload;
  }
};

function newVoteSubscribe(parent, args, context, info) {
  return context.prisma.$subscribe.vote({ mutation_in: ['CREATED'] }).node();
}

const newVote = {
  subscribe: newVoteSubscribe,
  resolve: payload => {
    return payload;
  }
};

module.exports = {
  newLink,
  newVote
};

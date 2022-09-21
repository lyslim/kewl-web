import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import { isNil } from 'lodash';
import React, { useState } from 'react';
import { Post, PostSnippetFragment, PostsQuery, useVoteMutation, VoteStatus } from '../generated/graphql';

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');

	const [, vote] = useVoteMutation();

	return (
		<Flex direction="column" alignItems="center" justifyContent="center" mr="4">
			<IconButton
				aria-label="upvote"
				icon={<ChevronUpIcon fontSize="24" />}
				isLoading={loadingState === 'updoot-loading'}
				colorScheme={post.voteStatus === VoteStatus.Up ? 'green' : undefined}
				onClick={async () => {
					if (post.voteStatus === VoteStatus.Up) {
						return;
					}

					setLoadingState('updoot-loading');

					vote({ value: 1, postUuid: post.uuid });

					setLoadingState('not-loading');
				}}
			></IconButton>
			{post.points}
			<IconButton
				aria-label="downvote"
				icon={<ChevronDownIcon fontSize="24" />}
				isLoading={loadingState === 'downdoot-loading'}
				colorScheme={post.voteStatus === VoteStatus.Down ? 'red' : undefined}
				onClick={async () => {
					if (post.voteStatus === VoteStatus.Down) {
						return;
					}
					setLoadingState('downdoot-loading');
					vote({ value: -1, postUuid: post.uuid });
					setLoadingState('not-loading');
				}}
			></IconButton>
		</Flex>
	);
};

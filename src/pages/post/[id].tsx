import { withUrqlClient } from 'next-urql';

import { createUrqlClient } from '../../utils/createUrqlClient';

import { useRouter } from 'next/router';
import { usePostQuery } from '../../generated/graphql';
import { Layout } from '../../components/Layout';
import { Box, Heading } from '@chakra-ui/react';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';

const Post = ({}) => {
	const router = useRouter();

	const postId = typeof router.query.id === 'string' ? router.query.id : 'INVALID';

	const [{ data, error, fetching }] = usePostQuery({
		pause: postId === 'INVALID',
		variables: {
			id: postId,
		},
	});

	if (fetching) {
		return (
			<Layout>
				<div>loading...</div>
			</Layout>
		);
	}

	if (error) {
		return <div>{error.message}</div>;
	}

	if (!data?.post) {
		return (
			<Layout>
				<Box>could not find post</Box>
			</Layout>
		);
	}

	return (
		<Layout>
			<Heading mb={4}>{data?.post?.title}</Heading>
			{data?.post?.text}

			<EditDeletePostButtons uuid={data.post.uuid} creatorId={data.post.creator.uuid}></EditDeletePostButtons>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);

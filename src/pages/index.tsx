import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, Link } from '@chakra-ui/layout';
import { Box, Button, Heading, Icon, IconButton, Stack, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';

import { Layout } from '../components/Layout';
import { UpdootSection } from '../components/UpdootSection';
import { useDeletePostMutation, useMeQuery, usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
	const [variables, setVariables] = useState({ limit: 20, cursor: null as null | string });

	const { data, error, loading } = usePostsQuery({
		variables,
	});

	const [, deletePost] = useDeletePostMutation();

	const { data: meData } = useMeQuery();

	if (!loading && !data) {
		return (
			<div>
				<div> you got query failed for some reason</div>
				<div>{error?.message}</div>
			</div>
		);
	}

	return (
		<Layout>
			{!data && loading ? (
				<div>loading...</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.posts.map((p, i) =>
						!p ? null : (
							<Flex key={p.uuid} p={5} shadow="md" borderWidth="1px" alignItems="center">
								<UpdootSection post={p}></UpdootSection>
								<Box flex={1}>
									<NextLink href={{ pathname: '/post/[id]', query: { id: p.uuid } }}>
										<Link>
											<Heading fontSize="xl">{`No. ${i + 1} - ${p.title}`}</Heading>
										</Link>
									</NextLink>

									<Text>posted by {p.creator.name}</Text>
									<Text mt={4}>{p.textSnippet}</Text>
								</Box>

								<Box ml="auto">
									<EditDeletePostButtons uuid={p.uuid} creatorId={p.creator.uuid} />
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}
			{data?.posts?.hasMore ? (
				<Flex>
					<Button
						isLoading={loading}
						m="auto"
						mt={8}
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
							});
						}}
					>
						load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default Index;

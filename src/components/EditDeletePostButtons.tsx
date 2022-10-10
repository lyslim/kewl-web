import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, IconButton, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
	uuid: string;
	creatorId: string;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ uuid, creatorId }) => {
	const { data: meData } = useMeQuery();
	const [deletePost] = useDeletePostMutation();

	if (meData?.me?.uuid !== creatorId) {
		return null;
	}

	return (
		<Box>
			<NextLink href={{ pathname: '/post/edit/[id]', query: { id: uuid } }}>
				<IconButton as={Link} mr={4} icon={<EditIcon />} aria-label="Edit Post" />
			</NextLink>
			<IconButton
				icon={<DeleteIcon />}
				aria-label="Delete Post"
				colorScheme="red"
				onClick={() => {
					deletePost({ variables: {id: uuid} });
				}}
			/>
		</Box>
	);
};

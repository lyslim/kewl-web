import { Box, Flex, Link } from '@chakra-ui/layout';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';
import { Heading } from '@chakra-ui/react';
import { useApolloClient } from '@apollo/client';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
	const { data, loading } = useMeQuery({
		skip: isServer(),
	});
	const [logout, { loading: logoutFetching }] = useLogoutMutation();

	const apolloClient = useApolloClient();

	let body = null;

	if (loading) {
		/* do nothing */
	} else if (data?.me) {
		body = (
			<Flex align="center">
				<NextLink href="/create-post">
					<Button as={Link} mr={4}>
						create post
					</Button>
					{/* <Link mr={2}>create post</Link> */}
				</NextLink>
				<Box mr={2}>{`Hello, ${data.me.name}`}</Box>
				<Button
					variant="link"
					onClick={async () => {
						await logout();
						await apolloClient.resetStore();
					}}
					isLoading={logoutFetching}
				>
					Logout
				</Button>
			</Flex>
		);
	} else {
		body = (
			<>
				<NextLink href="/register">
					<Link mr={2}>Register</Link>
				</NextLink>
				<NextLink href="/login">
					<Link>Login</Link>
				</NextLink>
			</>
		);
	}

	return (
		<Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4} justifyContent="right" align="center">
			<Flex flex={1} m="auto" align="center" maxW={800}>
				<NextLink href="/">
					<Link>
						<Heading>Kewl Movies</Heading>
					</Link>
				</NextLink>

				<Box ml={'auto'}>{body}</Box>
			</Flex>
		</Flex>
	);
};

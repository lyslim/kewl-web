import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorRecord } from '../utils/toErrorMap';

interface loginProps {}

export const Login: React.FC<loginProps> = ({}) => {
	const router = useRouter();
	console.log(router);
	const [, login] = useLoginMutation();

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ usernameOrEmail: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await login(values);
					if (response.data?.login.errors) {
						setErrors(toErrorRecord(response.data.login.errors));
					} else if (response.data?.login.user) {
						if (typeof router.query.next === 'string') {
							router.push(router.query.next);
						} else {
							router.push('/');
						}
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="usernameOrEmail" label="User name or Email" placeholder="user name or email"></InputField>
						<Box mt={4}>
							<InputField name="password" label="Password" placeholder="password" type="password"></InputField>
						</Box>
						<Flex>
							<NextLink href="/forgot-password">
								<Link mt={4} ml="auto">
									forgot password?
								</Link>
							</NextLink>
						</Flex>
						<Button mt={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>
							Login
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Login);

import { Button } from '@chakra-ui/button';
import { Box, Flex, Link } from '@chakra-ui/layout';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorRecord } from '../../utils/toErrorMap';

export const ChangePassword: NextPage<{ token: string }> = () => {
	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState('');
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ newPassword: '' }}
				onSubmit={async ({ newPassword }, { setErrors }) => {
					const response = await changePassword({
						newPassword,
						token: router.query.token === 'string' ? router.query.token : '',
					});
					if (response.data?.changePassword.errors) {
						const errorRecords = toErrorRecord(response.data.changePassword.errors);

						if ('token' in errorRecords) {
							setTokenError(errorRecords.token);
						}

						setErrors(errorRecords);
					} else if (response.data?.changePassword.user) {
						router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="newPassword" label="New Password" placeholder="New password" type="password"></InputField>
						{tokenError ? (
							<Flex>
								<Box mr={2} color="red">
									{tokenError}
								</Box>
								<NextLink href="/forgot-password">
									<Link>Click here to get a new one</Link>
								</NextLink>
							</Flex>
						) : null}
						<Button mt={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>
							Change Password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ChangePassword);

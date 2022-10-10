import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';

import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
	const [complete, setComplete] = useState(false);
	const [forgotPassword] = useForgotPasswordMutation();

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async (values, { setErrors }) => {
					await forgotPassword({variables: values});
					setComplete(true);
				}}
			>
				{({ isSubmitting }) =>
					complete ? (
						<Box>If an account with that email exists, we sent you an email</Box>
					) : (
						<Form>
							<InputField name="email" label="Email" placeholder="Email" type="email"></InputField>
							<Button mt={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>
								Forgot password
							</Button>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	);
};

export default ForgotPassword;

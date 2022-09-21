import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorRecord } from '../utils/toErrorMap';

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
	const router = useRouter();
	const [, register] = useRegisterMutation();

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ username: '', email: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					console.log(values);
					const response = await register({ options: values });
					if (response.data?.register.errors) {
						setErrors(toErrorRecord(response.data.register.errors));
					} else if (response.data?.register.user) {
						router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="username" label="User name" placeholder="user name"></InputField>
						<Box mt={4}>
							<InputField name="email" label="Email" placeholder="email"></InputField>
						</Box>
						<Box mt={4}>
							<InputField name="password" label="Password" placeholder="password" type="password"></InputField>
						</Box>
						<Button mt={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>
							Register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Register);

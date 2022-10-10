import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';

import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { useUpdatePostMutation, usePostQuery } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';

export const EditPost = ({}) => {
	const router = useRouter();

	const id = router.query.id ? (router.query.id as string) : 'INVALID';

	const { data, loading } = usePostQuery({
		skip: id === 'INVALID',
		variables: { id },
	});

	const [updatePost] = useUpdatePostMutation();

	if (loading) {
		return (
			<Layout>
				<div>loading...</div>
			</Layout>
		);
	}

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: data?.post?.title ?? '', text: data?.post?.text ?? '' }}
				onSubmit={async values => {
					console.log(values);

					if (id) {
						const { errors } = await updatePost( {variables: { id, ...values }});
						if (!errors) {
							router.back();
						}
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="title" label="Title" placeholder="title"></InputField>
						<Box mt={4}>
							<InputField textarea name="text" label="Body" placeholder="text..."></InputField>
						</Box>
						<Button mt={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>
							update post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default EditPost;

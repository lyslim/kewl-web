import { dedupExchange, fetchExchange, gql } from '@urql/core';
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { Exchange, stringifyVariables } from 'urql';
import { pipe, tap } from 'wonka';

import {
	DeletePostMutationVariables,
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	Post,
	PostsDocument,
	PostsQuery,
	RegisterMutation,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { isServer } from './isServer';

const errorExchange: Exchange =
	({ forward }) =>
	ops$ => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				// If the OperationResult has an error send a request to sentry
				if (error) {
					// the error is a CombinedError with networkError and graphqlErrors properties
					// sentryFireAndForgetHere(); // Whatever error reporting you have
					if (error?.message.includes('not authenticated')) {
						Router.replace('/login');
					}
				}
			})
		);
	};

const cursorPagination = (): Resolver<any, any, any> => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;
		// console.log(entityKey, fieldName);

		const allFields = cache.inspectFields(entityKey);

		// console.log('all fields: ' + JSON.stringify(allFields));
		const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		const isItInCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, 'posts');
		info.partial = !isItInCache;

		const results: Post[] = [];
		let hasMore = true;
		fieldInfos.forEach(fi => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const posts = cache.resolve(key, 'posts') as Post[];
			const _hasMore = cache.resolve(key, 'hasMore');

			hasMore = hasMore && (_hasMore as boolean);
			results.push(...posts);
		});

		return {
			__typename: 'PaginatedPosts',
			hasMore: hasMore,
			posts: results,
		};

		// const visited = new Set();
		// let result: NullArray<string> = [];
		// let prevOffset: number | null = null;

		// for (let i = 0; i < size; i++) {
		// 	const { fieldKey, arguments: args } = fieldInfos[i];
		// 	if (args === null || !compareArgs(fieldArgs, args)) {
		// 		continue;
		// 	}

		// 	const links = cache.resolve(entityKey, fieldKey) as string[];
		// 	const currentOffset = args[cursorArgument];

		// 	if (links === null || links.length === 0 || typeof currentOffset !== 'number') {
		// 		continue;
		// 	}

		// 	const tempResult: NullArray<string> = [];

		// 	for (let j = 0; j < links.length; j++) {
		// 		const link = links[j];
		// 		if (visited.has(link)) continue;
		// 		tempResult.push(link);
		// 		visited.add(link);
		// 	}

		// 	if ((!prevOffset || currentOffset > prevOffset) === (mergeMode === 'after')) {
		// 		result = [...result, ...tempResult];
		// 	} else {
		// 		result = [...tempResult, ...result];
		// 	}

		// 	prevOffset = currentOffset;
		// }

		// const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
		// if (hasCurrentPage) {
		// 	return result;
		// } else if (!(info as any).store.schema) {
		// 	return undefined;
		// } else {
		// 	info.partial = true;
		// 	return result;
		// }
	};
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = '';
	if (isServer()) {
		cookie = ctx?.req?.headers?.cookie;
	}

	return {
		url: process.env.NEXT_PUBLIC_API_URL as string,
		fetchOptions: {
			credentials: 'include' as const,
			headers: cookie ? { cookie } : undefined,
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				keys: {
					Post: data => data.uuid as string,
					PaginatedPosts: data => data.uuid as string,
					User: data => data.uuid as string,
				},
				updates: {
					Mutation: {
						deletePost: (_result, args, cache, info) => {
							cache.invalidate({ __typename: 'Post', uuid: (args as DeletePostMutationVariables).id });
						},

						vote: (_result, args, cache, info) => {
							/**
							 * approach 1: backend return latest post points and vote status
							 *             frontend write that to the cache and reflect in UI
							 */
							//get points and voteStatus from API response
							const { uuid, points, voteStatus } = _result.vote as Post;

							// write latest value from fragment to cache
							cache.writeFragment(
								gql`
									fragment _ on Post {
										points
										voteStatus
									}
								`,
								{
									uuid,
									points,
									voteStatus,
								}
							);

							/**
							 * approach 2: both read/write cache on frontend
							 *    pros - no result needed from API response
							 *    cons - duplicated logic on frontend for calculating points & vote status
							 *
							 * this requires backend API NOT sending updated points and voteStatus,
							 * otherwise, the readFragment will read such updated info. already from the response
							 */
							// const { postUuid, value } = args as VoteMutationVariables;

							// const data = cache.readFragment(
							// 	gql`
							// 		fragment _ on Post {
							// 			uuid
							// 			points
							// 			voteStatus
							// 		}
							// 	`,
							// 	{
							// 		uuid: postUuid,
							// 	}
							// );

							// if (data) {
							// 	// if making the same vote, do nothing
							// 	if (data.voteStatus === value) {
							// 		return;
							// 	}

							// 	// if never vote before vote points should be 1, otherwise it should be doubled
							// 	const newPoints = data.points + (data.voteStatus === VoteStatus.Na ? 1 : 2) * value;

							// 	cache.writeFragment(
							// 		gql`
							// 			fragment __ on Post {
							// 				points
							// 				voteStatus
							// 			}
							// 		`,
							// 		{ uuid: postUuid, points: newPoints, voteStatus: value === 1 ? VoteStatus.Up : VoteStatus.Down }
							// 	);
							// }
						},
						createPost: (_result, args, cache, info) => {
							const allFields = cache.inspectFields('Query');
							const fieldInfos = allFields.filter(info => info.fieldName === 'posts');

							fieldInfos.forEach(fi => {
								cache.invalidate('Query', 'posts', fi.arguments);
							});
						},

						logout: (_result, args, cache, info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument }, _result, () => ({ me: null }));

							betterUpdateQuery<LoginMutation, PostsQuery>(cache, { query: PostsDocument }, _result, (result, query) => {
								const allFields = cache.inspectFields('Query');
								const fieldInfos = allFields.filter(info => info.fieldName === 'posts');

								fieldInfos.forEach(fi => {
									cache.invalidate('Query', 'posts', fi.arguments);
								});

								return query;
							});
						},

						login: (_result, args, cache, info) => {
							betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
								if (result.login.errors) {
									return query;
								} else {
									return {
										me: result.login.user,
									};
								}
							});

							betterUpdateQuery<LoginMutation, PostsQuery>(cache, { query: PostsDocument }, _result, (result, query) => {
								const allFields = cache.inspectFields('Query');
								const fieldInfos = allFields.filter(info => info.fieldName === 'posts');

								fieldInfos.forEach(fi => {
									cache.invalidate('Query', 'posts', fi.arguments);
								});

								return query;
							});
						},

						register: (_result, args, cache, info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
								if (result.register.errors) {
									return query;
								} else {
									return {
										me: result.register.user,
									};
								}
							});
						},
					},
				},
			}),
			errorExchange,
			ssrExchange,
			fetchExchange,
		],
	};
};

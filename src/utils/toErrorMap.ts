import { FieldError } from '../generated/graphql';

export function toErrorRecord(fieldErrors: Array<FieldError>): Record<string, string> {
	const record: Record<string, string> = {};

	fieldErrors.forEach(({ field, message }) => {
		record[field] = message;
	});

	return record;
}

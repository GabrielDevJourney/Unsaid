/**
 * Standard service return types for consistent error handling.
 *
 * Services should NEVER throw for expected errors (validation, business rules).
 * They SHOULD throw for unexpected errors (DB connection, etc.) which bubble up
 * to be caught by the controller and logged.
 *
 * Usage:
 * - Success: return { data: result }
 * - Expected error: return { error: "message" }
 * - Unexpected error: throw (let controller handle)
 *
 * Exception: Streaming services return the stream directly (e.g., StreamTextResult).
 * These are documented separately and don't use ServiceResult.
 */

/**
 * Successful service result containing data.
 */
export type ServiceSuccess<T> = {
    data: T;
    error?: never;
};

/**
 * Failed service result containing error message.
 */
export type ServiceError = {
    data?: never;
    error: string;
};

/**
 * Discriminated union for service results.
 * Use type guard `isServiceError` to narrow the type.
 *
 * @example
 * const result = await createEntry(supabase, userId, payload);
 * if (isServiceError(result)) {
 *   return NextResponse.json({ error: result.error }, { status: 400 });
 * }
 * return NextResponse.json({ data: result.data });
 */
export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

/**
 * Type guard to check if result is an error.
 *
 * @example
 * if (isServiceError(result)) {
 *   // result.error is string
 * } else {
 *   // result.data is T
 * }
 */
export const isServiceError = <T>(
    result: ServiceResult<T>,
): result is ServiceError => {
    return "error" in result && result.error !== undefined;
};

/**
 * Type guard to check if result is successful.
 */
export const isServiceSuccess = <T>(
    result: ServiceResult<T>,
): result is ServiceSuccess<T> => {
    return "data" in result && result.data !== undefined;
};

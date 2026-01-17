import { db } from "./db";

type Severity = "error" | "warning" | "info";

interface LogErrorOptions {
  message: string;
  stack?: string;
  context?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  severity?: Severity;
}

/**
 * Log an error to the database
 */
export async function logError(options: LogErrorOptions): Promise<void> {
  try {
    await db.errorLog.create({
      data: {
        message: options.message,
        stack: options.stack,
        context: options.context,
        endpoint: options.endpoint,
        method: options.method,
        userId: options.userId,
        severity: options.severity || "error",
      },
    });
  } catch (logErr) {
    // If logging fails, at least log to console
    console.error("Failed to log error to database:", logErr);
    console.error("Original error:", options);
  }
}

/**
 * Log an error from an API route handler
 */
export async function logApiError(
  error: unknown,
  endpoint: string,
  method: string,
): Promise<void> {
  const err = error as Error;
  await logError({
    message: err.message || "Unknown error",
    stack: err.stack,
    endpoint,
    method,
    severity: "error",
  });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
): Response {
  return Response.json({ error: message }, { status });
}

/**
 * Wrapper for API route handlers with error logging
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>,
  endpoint: string,
  method: string,
) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      await logApiError(error, endpoint, method);
      console.error(`[${method}] ${endpoint}:`, error);
      return createErrorResponse("Internal server error", 500);
    }
  };
}

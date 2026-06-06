import axios from "axios";

type ErrorOverride = {
  match: RegExp | string;
  message: string;
};

function extractApiMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "";
  }

  const responseData = error.response?.data as
    | { message?: unknown; error?: unknown; errors?: unknown }
    | string
    | undefined;

  if (typeof responseData === "string") {
    return responseData;
  }

  const message = responseData?.message ?? responseData?.error ?? error.message;
  return typeof message === "string" ? message : "";
}

export function getFriendlyApiError(
  error: unknown,
  fallbackMessage: string,
  overrides: ErrorOverride[] = [],
) {
  const message = extractApiMessage(error);

  for (const override of overrides) {
    const matches =
      override.match instanceof RegExp
        ? override.match.test(message)
        : message === override.match;

    if (matches) {
      return override.message;
    }
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409 && message) {
      return message;
    }

    if (error.response?.status === 403 && message) {
      return message;
    }

    if (message) {
      return message;
    }
  }

  return fallbackMessage;
}

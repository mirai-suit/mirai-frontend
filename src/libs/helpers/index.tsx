export const handleApiError = (
  error: any,
): { message: string; error: string } => {
  if (error.response) {
    return {
      message: error.response.data?.message || "Server error",
      error: error.response.status.toString(),
    };
  } else if (error.request) {
    return {
      message: "No response from server",
      error: "network_error",
    };
  } else {
    return {
      message: error.message || "An unknown error occurred",
      error: "unknown_error",
    };
  }
};

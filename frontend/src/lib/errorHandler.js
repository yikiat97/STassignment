// src/utils/errorHandler.js
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";

// Function to handle a general error message
export function customError(error) {
  toast.error(`Error: ${error || "Something went wrong!"}`);
}

export function customAlert(success) {
  toast.success(`${success || "Something went wrong!"}`);
}
;

// Function to handle a general error message
export function handleError(error) {
  if (error.message == "Access denied") {
    goto("/login")
  }
  toast.error(`Error: ${error.message || "Something went wrong!"}`);
}

// Function for handling specific error scenarios
export function handleNetworkError() {
  toast.error("Network error: Please check your connection.");
}

export function handleUnauthorizedError() {
  toast.error(
    "Unauthorized: You do not have permission to access this resource."
  );
}

export function handleValidationError(field) {
  toast.error(`Validation error: ${field} is invalid.`);
}



// More specific error handling functions can be added here...

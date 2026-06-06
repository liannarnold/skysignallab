package handlers

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error" example:"something went wrong"`
}

// MessageResponse represents a simple success message
type MessageResponse struct {
	Message string `json:"message" example:"operation successful"`
}

// IDResponse represents a newly created resource ID
type IDResponse struct {
	ID string `json:"id" example:"d551cff8-efd1-463c-811a-8fa48fc696d6"`
}
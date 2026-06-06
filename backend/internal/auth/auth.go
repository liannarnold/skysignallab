package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/liannarnold/skysignallab/internal/db"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Username string `json:"username" example:"liannarnold"`
	Email    string `json:"email"    example:"liane@example.com"`
	Password string `json:"password" example:"SecurePassword123"`
}

type LoginRequest struct {
	Email    string `json:"email"    example:"liane@example.com"`
	Password string `json:"password" example:"SecurePassword123"`
}

type AuthResponse struct {
	Token    string `json:"token"     example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	UserID   string `json:"user_id"   example:"d551cff8-efd1-463c-811a-8fa48fc696d6"`
	Username string `json:"username"  example:"liannarnold"`
	IsAdmin  bool   `json:"is_admin"  example:"false"`
}

// Register godoc
// @Summary      Register a new user
// @Description  Creates a new user account and returns a JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      RegisterRequest  true  "Registration details"
// @Success      201      {object}  AuthResponse
// @Failure      400      {object}  handlers.ErrorResponse
// @Failure      409      {object}  handlers.ErrorResponse
// @Failure      500      {object}  handlers.ErrorResponse
// @Router       /auth/register [post]
func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		http.Error(w, `{"error":"username, email and password are required"}`, http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Error().Err(err).Msg("Failed to hash password")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	var userID string
	err = db.Pool.QueryRow(context.Background(),
		`INSERT INTO users (username, email, password) 
		 VALUES ($1, $2, $3) 
		 RETURNING id`,
		req.Username, req.Email, string(hashedPassword),
	).Scan(&userID)

	if err != nil {
		log.Error().Err(err).Msg("Failed to create user")
		http.Error(w, `{"error":"username or email already exists"}`, http.StatusConflict)
		return
	}

	token, err := generateToken(userID, req.Username, false)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{
		Token:    token,
		UserID:   userID,
		Username: req.Username,
		IsAdmin:  false,
	})
}

// Login godoc
// @Summary      Login
// @Description  Authenticates a user and returns a JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body      LoginRequest  true  "Login credentials"
// @Success      200      {object}  AuthResponse
// @Failure      400      {object}  handlers.ErrorResponse
// @Failure      401      {object}  handlers.ErrorResponse
// @Failure      500      {object}  handlers.ErrorResponse
// @Router       /auth/login [post]
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, `{"error":"email and password are required"}`, http.StatusBadRequest)
		return
	}

	var userID, username, hashedPassword string
	var isAdmin bool
	err := db.Pool.QueryRow(context.Background(),
		`SELECT id, username, password, is_admin FROM users WHERE email = $1`,
		req.Email,
	).Scan(&userID, &username, &hashedPassword, &isAdmin)

	if err != nil {
		http.Error(w, `{"error":"invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		http.Error(w, `{"error":"invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	token, err := generateToken(userID, username, isAdmin)
	if err != nil {
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Token:    token,
		UserID:   userID,
		Username: username,
		IsAdmin:  isAdmin,
	})
}

// Logout godoc
// @Summary      Logout
// @Description  Logs out the current user (client should discard the JWT token)
// @Tags         auth
// @Produce      json
// @Success      200  {object}  handlers.MessageResponse
// @Router       /auth/logout [post]
func Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"logged out successfully"}`))
}

func generateToken(userID, username string, isAdmin bool) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"is_admin": isAdmin,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
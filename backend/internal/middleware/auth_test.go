package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestRequireAuthMissingHeader(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/favorites", nil)
	rr := httptest.NewRecorder()

	handler := RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 got %d", rr.Code)
	}
}

func TestRequireAuthInvalidToken(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/favorites", nil)
	req.Header.Set("Authorization", "Bearer invalidtoken")
	rr := httptest.NewRecorder()

	handler := RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 got %d", rr.Code)
	}
}

func TestRequireAuthValidToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "testsecret")

	// Generate a valid token
	claims := jwt.MapClaims{
		"user_id":  "test-user-id",
		"username": "testuser",
		"is_admin": false,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte("testsecret"))

	req := httptest.NewRequest(http.MethodGet, "/api/favorites", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	rr := httptest.NewRecorder()

	handler := RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 got %d", rr.Code)
	}
}
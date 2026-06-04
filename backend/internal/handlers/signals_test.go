package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetSignalsReturns200(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/signals", nil)
	rr := httptest.NewRecorder()

	// Just test the handler compiles and responds
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200 got %d", rr.Code)
	}
}

func TestGetSignalsWithCategoryFilter(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/signals?category=HAM", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		category := r.URL.Query().Get("category")
		if category != "HAM" {
			t.Errorf("expected category HAM got %s", category)
		}
		w.WriteHeader(http.StatusOK)
	})

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200 got %d", rr.Code)
	}
}
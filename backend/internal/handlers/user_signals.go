package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/liannarnold/skysignallab/internal/db"
	authMiddleware "github.com/liannarnold/skysignallab/internal/middleware"
	"github.com/rs/zerolog/log"
)

type UserSignal struct {
	ID          string  `json:"id"          example:"d551cff8-efd1-463c-811a-8fa48fc696d6"`
	Frequency   float64 `json:"frequency"   example:"162.4"`
	Mode        string  `json:"mode"        example:"NFM"`
	Description string  `json:"description" example:"NOAA Weather Radio"`
	Category    string  `json:"category,omitempty" example:"Weather"`
	Band        string  `json:"band,omitempty"     example:"2m"`
	CreatedAt   string  `json:"created_at"  example:"2026-06-05T00:00:00Z"`
}

type UserSignalRequest struct {
	Frequency   float64 `json:"frequency"   example:"162.4"`
	Mode        string  `json:"mode"        example:"NFM"`
	Description string  `json:"description" example:"NOAA Weather Radio"`
	Category    string  `json:"category"    example:"Weather"`
	Band        string  `json:"band"        example:"2m"`
}

// GetUserSignals godoc
// @Summary      Get user signals
// @Description  Returns all custom signals created by the authenticated user
// @Tags         user-signals
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   UserSignal
// @Failure      401  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Router       /user-signals [get]
func GetUserSignals(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)

	rows, err := db.Pool.Query(context.Background(),
		`SELECT id, frequency, mode, description, 
		 COALESCE(category, ''), COALESCE(band, ''), created_at::text
		 FROM user_signals WHERE user_id = $1
		 ORDER BY frequency ASC`,
		user.UserID,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query user signals")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	signals := []UserSignal{}
	for rows.Next() {
		var s UserSignal
		if err := rows.Scan(&s.ID, &s.Frequency, &s.Mode, &s.Description, &s.Category, &s.Band, &s.CreatedAt); err != nil {
			log.Error().Err(err).Msg("Failed to scan user signal row")
			continue
		}
		signals = append(signals, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(signals)
}

// CreateUserSignal godoc
// @Summary      Create a user signal
// @Description  Creates a new custom signal for the authenticated user
// @Tags         user-signals
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      UserSignalRequest  true  "Signal details"
// @Success      201      {object}  IDResponse
// @Failure      400      {object}  ErrorResponse
// @Failure      401      {object}  ErrorResponse
// @Failure      500      {object}  ErrorResponse
// @Router       /user-signals [post]
func CreateUserSignal(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)

	var req UserSignalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Frequency == 0 || req.Mode == "" || req.Description == "" {
		http.Error(w, `{"error":"frequency, mode and description are required"}`, http.StatusBadRequest)
		return
	}

	var id string
	err := db.Pool.QueryRow(context.Background(),
		`INSERT INTO user_signals (user_id, frequency, mode, description, category, band)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id`,
		user.UserID, req.Frequency, req.Mode, req.Description, req.Category, req.Band,
	).Scan(&id)

	if err != nil {
		log.Error().Err(err).Msg("Failed to create user signal")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(IDResponse{ID: id})
}

// UpdateUserSignal godoc
// @Summary      Update a user signal
// @Description  Updates an existing custom signal owned by the authenticated user
// @Tags         user-signals
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string             true  "Signal ID"
// @Param        request  body      UserSignalRequest  true  "Updated signal details"
// @Success      200      {object}  MessageResponse
// @Failure      400      {object}  ErrorResponse
// @Failure      401      {object}  ErrorResponse
// @Failure      404      {object}  ErrorResponse
// @Failure      500      {object}  ErrorResponse
// @Router       /user-signals/{id} [put]
func UpdateUserSignal(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)
	id := chi.URLParam(r, "id")

	var req UserSignalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	result, err := db.Pool.Exec(context.Background(),
		`UPDATE user_signals 
		 SET frequency = $1, mode = $2, description = $3, category = $4, band = $5
		 WHERE id = $6 AND user_id = $7`,
		req.Frequency, req.Mode, req.Description, req.Category, req.Band, id, user.UserID,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to update user signal")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, `{"error":"signal not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"signal updated"}`))
}

// DeleteUserSignal godoc
// @Summary      Delete a user signal
// @Description  Deletes a custom signal owned by the authenticated user
// @Tags         user-signals
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Signal ID"
// @Success      204  "No content"
// @Failure      401  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Router       /user-signals/{id} [delete]
func DeleteUserSignal(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)
	id := chi.URLParam(r, "id")

	result, err := db.Pool.Exec(context.Background(),
		`DELETE FROM user_signals WHERE id = $1 AND user_id = $2`,
		id, user.UserID,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to delete user signal")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, `{"error":"signal not found"}`, http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
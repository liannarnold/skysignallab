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

type Favorite struct {
	ID          string  `json:"id"          example:"d551cff8-efd1-463c-811a-8fa48fc696d6"`
	SignalID    string  `json:"signal_id"   example:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
	Frequency   float64 `json:"frequency"   example:"162.4"`
	Mode        string  `json:"mode"        example:"NFM"`
	Description string  `json:"description" example:"NOAA Weather Radio"`
	Category    string  `json:"category"    example:"Weather"`
	Band        string  `json:"band,omitempty" example:"2m"`
	Notes       string  `json:"notes,omitempty" example:"My local weather station"`
	CreatedAt   string  `json:"created_at"  example:"2026-06-05T00:00:00Z"`
}

type AddFavoriteRequest struct {
	SignalID string `json:"signal_id" example:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
	Notes    string `json:"notes"     example:"My local weather station"`
}

type UpdateFavoriteRequest struct {
	Notes string `json:"notes" example:"Updated note"`
}

// GetFavorites godoc
// @Summary      Get user favorites
// @Description  Returns all favorited signals for the authenticated user
// @Tags         favorites
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   Favorite
// @Failure      401  {object}  handlers.ErrorResponse
// @Failure      500  {object}  handlers.ErrorResponse
// @Router       /favorites [get]
func GetFavorites(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)

	rows, err := db.Pool.Query(context.Background(),
		`SELECT f.id, f.signal_id, s.frequency, s.mode, s.description, 
		 s.category, COALESCE(s.band, ''), COALESCE(f.notes, ''), f.created_at::text
		 FROM favorites f
		 JOIN signals s ON s.id = f.signal_id
		 WHERE f.user_id = $1
		 ORDER BY f.created_at DESC`,
		user.UserID,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query favorites")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	favorites := []Favorite{}
	for rows.Next() {
		var f Favorite
		if err := rows.Scan(&f.ID, &f.SignalID, &f.Frequency, &f.Mode, &f.Description, &f.Category, &f.Band, &f.Notes, &f.CreatedAt); err != nil {
			log.Error().Err(err).Msg("Failed to scan favorite row")
			continue
		}
		favorites = append(favorites, f)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(favorites)
}

// AddFavorite godoc
// @Summary      Add a favorite
// @Description  Saves a signal to the authenticated user's favorites
// @Tags         favorites
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      AddFavoriteRequest  true  "Signal to favorite"
// @Success      201      {object}  IDResponse
// @Failure      400      {object}  handlers.ErrorResponse
// @Failure      401      {object}  handlers.ErrorResponse
// @Failure      409      {object}  handlers.ErrorResponse
// @Router       /favorites [post]
func AddFavorite(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)

	var req AddFavoriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.SignalID == "" {
		http.Error(w, `{"error":"signal_id is required"}`, http.StatusBadRequest)
		return
	}

	var id string
	err := db.Pool.QueryRow(context.Background(),
		`INSERT INTO favorites (user_id, signal_id, notes)
		 VALUES ($1, $2, $3)
		 RETURNING id`,
		user.UserID, req.SignalID, req.Notes,
	).Scan(&id)

	if err != nil {
		log.Error().Err(err).Msg("Failed to add favorite")
		http.Error(w, `{"error":"signal already favorited or not found"}`, http.StatusConflict)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(IDResponse{ID: id})
}

// RemoveFavorite godoc
// @Summary      Remove a favorite
// @Description  Removes a signal from the authenticated user's favorites
// @Tags         favorites
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Favorite ID"
// @Success      204  "No content"
// @Failure      401  {object}  handlers.ErrorResponse
// @Failure      404  {object}  handlers.ErrorResponse
// @Failure      500  {object}  handlers.ErrorResponse
// @Router       /favorites/{id} [delete]
func RemoveFavorite(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)
	id := chi.URLParam(r, "id")

	result, err := db.Pool.Exec(context.Background(),
		`DELETE FROM favorites WHERE id = $1 AND user_id = $2`,
		id, user.UserID,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to remove favorite")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, `{"error":"favorite not found"}`, http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UpdateFavorite godoc
// @Summary      Update favorite notes
// @Description  Updates the personal notes on a favorited signal
// @Tags         favorites
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string               true  "Favorite ID"
// @Param        request  body      UpdateFavoriteRequest  true  "Updated notes"
// @Success      200      {object}  handlers.MessageResponse
// @Failure      400      {object}  handlers.ErrorResponse
// @Failure      401      {object}  handlers.ErrorResponse
// @Failure      404      {object}  handlers.ErrorResponse
// @Failure      500      {object}  handlers.ErrorResponse
// @Router       /favorites/{id} [patch]
func UpdateFavorite(w http.ResponseWriter, r *http.Request) {
	user := authMiddleware.GetUser(r)
	id := chi.URLParam(r, "id")

	var req UpdateFavoriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	result, err := db.Pool.Exec(context.Background(),
		`UPDATE favorites SET notes = $1 WHERE id = $2 AND user_id = $3`,
		req.Notes, id, user.UserID,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to update favorite")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, `{"error":"favorite not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"favorite updated"}`))
}
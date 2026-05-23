package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	authMiddleware "github.com/liannarnold/skysignallab/internal/middleware"
	"github.com/liannarnold/skysignallab/internal/db"
	"github.com/rs/zerolog/log"
)

type Favorite struct {
	ID        string  `json:"id"`
	SignalID  string  `json:"signal_id"`
	Frequency float64 `json:"frequency"`
	Mode      string  `json:"mode"`
	Description string `json:"description"`
	Category  string  `json:"category"`
	Band      string  `json:"band,omitempty"`
	Notes     string  `json:"notes,omitempty"`
	CreatedAt string  `json:"created_at"`
}

type AddFavoriteRequest struct {
	SignalID string `json:"signal_id"`
	Notes   string `json:"notes"`
}

type UpdateFavoriteRequest struct {
	Notes string `json:"notes"`
}

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
	json.NewEncoder(w).Encode(map[string]string{"id": id})
}

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
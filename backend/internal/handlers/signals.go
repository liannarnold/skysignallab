package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/liannarnold/skysignallab/internal/db"
	"github.com/rs/zerolog/log"
)

type Signal struct {
	ID          string  `json:"id"`
	Frequency   float64 `json:"frequency"`
	Mode        string  `json:"mode"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Band        string  `json:"band,omitempty"`
	CreatedAt   string  `json:"created_at"`
}

func GetSignals(w http.ResponseWriter, r *http.Request) {
	// Optional query filters
	mode     := r.URL.Query().Get("mode")
	category := r.URL.Query().Get("category")
	band     := r.URL.Query().Get("band")
	freqMin  := r.URL.Query().Get("freq_min")
	freqMax  := r.URL.Query().Get("freq_max")

	query := `SELECT id, frequency, mode, description, category, 
			  COALESCE(band, ''), created_at::text 
			  FROM signals WHERE 1=1`
	args  := []interface{}{}
	i     := 1

	if mode != "" {
		query += ` AND mode = $` + strconv.Itoa(i)
		args = append(args, mode)
		i++
	}
	if category != "" {
		query += ` AND category = $` + strconv.Itoa(i)
		args = append(args, category)
		i++
	}
	if band != "" {
		query += ` AND band = $` + strconv.Itoa(i)
		args = append(args, band)
		i++
	}
	if freqMin != "" {
		query += ` AND frequency >= $` + strconv.Itoa(i)
		args = append(args, freqMin)
		i++
	}
	if freqMax != "" {
		query += ` AND frequency <= $` + strconv.Itoa(i)
		args = append(args, freqMax)
		i++
	}

	query += ` ORDER BY frequency ASC`

	rows, err := db.Pool.Query(context.Background(), query, args...)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query signals")
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	signals := []Signal{}
	for rows.Next() {
		var s Signal
		if err := rows.Scan(&s.ID, &s.Frequency, &s.Mode, &s.Description, &s.Category, &s.Band, &s.CreatedAt); err != nil {
			log.Error().Err(err).Msg("Failed to scan signal row")
			continue
		}
		signals = append(signals, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(signals)
}

func GetSignal(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var s Signal
	err := db.Pool.QueryRow(context.Background(),
		`SELECT id, frequency, mode, description, category, 
		 COALESCE(band, ''), created_at::text 
		 FROM signals WHERE id = $1`, id,
	).Scan(&s.ID, &s.Frequency, &s.Mode, &s.Description, &s.Category, &s.Band, &s.CreatedAt)

	if err != nil {
		http.Error(w, `{"error":"signal not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}
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
// GetSignals godoc
// @Summary      List all signals
// @Description  Returns all signals with optional filters
// @Tags         signals
// @Produce      json
// @Param        mode      query  string  false  "Filter by mode (AM, FM, NFM, USB, LSB)"
// @Param        category  query  string  false  "Filter by category (HAM, Weather, Aviation, etc)"
// @Param        band      query  string  false  "Filter by band (2m, 40m, etc)"
// @Param        freq_min  query  number  false  "Minimum frequency in MHz"
// @Param        freq_max  query  number  false  "Maximum frequency in MHz"
// @Success      200  {array}   Signal
// @Router       /signals [get]
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

// GetSignal godoc
// @Summary      Get a single signal
// @Description  Returns a signal by ID
// @Tags         signals
// @Produce      json
// @Param        id  path  string  true  "Signal ID"
// @Success      200  {object}  Signal
// @Failure      404  {object}  map[string]string
// @Router       /signals/{id} [get]
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
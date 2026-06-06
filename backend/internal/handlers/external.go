package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/liannarnold/skysignallab/internal/external"
	"github.com/rs/zerolog/log"
)

type Repeater struct {
	Callsign  string `json:"callsign"`
	Frequency string `json:"frequency"`
	Offset    string `json:"offset"`
	PL        string `json:"pl"`
	Band      string `json:"band"`
	Location  string `json:"location"`
}

func GetBandConditions(w http.ResponseWriter, r *http.Request) {
	conditions, err := external.FetchBandConditions()
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch band conditions")
		http.Error(w, `{"error":"failed to fetch band conditions"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conditions)
}

func GetRepeaters(w http.ResponseWriter, r *http.Request) {
	repeaters := []Repeater{
		{Callsign: "W5SLA", Frequency: "146.9400", Offset: "-", PL: "100.0", Band: "2m", Location: "Shreveport, LA"},
		{Callsign: "K5BCC", Frequency: "147.1800", Offset: "+", PL: "127.3", Band: "2m", Location: "Bossier City, LA"},
		{Callsign: "KD5LJQ", Frequency: "443.8750", Offset: "+", PL: "88.5", Band: "70cm", Location: "Bossier City, LA"},
		{Callsign: "WB5MZO", Frequency: "146.6400", Offset: "-", PL: "110.9", Band: "2m", Location: "Minden, LA"},
		{Callsign: "W5BII", Frequency: "444.8500", Offset: "+", PL: "100.0", Band: "70cm", Location: "Shreveport, LA"},
		{Callsign: "K5QHD", Frequency: "147.0600", Offset: "+", PL: "88.5", Band: "2m", Location: "Shreveport, LA"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(repeaters)
}
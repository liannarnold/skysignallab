package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/liannarnold/skysignallab/internal/external"
	"github.com/rs/zerolog/log"
)

type Repeater struct {
	Callsign  string `json:"callsign"  example:"W5SLA"`
	Frequency string `json:"frequency" example:"146.9400"`
	Offset    string `json:"offset"    example:"-"`
	PL        string `json:"pl"        example:"100.0"`
	Band      string `json:"band"      example:"2m"`
	Location  string `json:"location"  example:"Shreveport, LA"`
}

// GetBandConditions godoc
// @Summary      Get HF band conditions
// @Description  Returns current HF band conditions from hamqsl.com
// @Tags         external
// @Produce      json
// @Success      200  {array}   external.BandCondition
// @Failure      500  {object}  ErrorResponse
// @Router       /band-conditions [get]
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

// GetRepeaters godoc
// @Summary      Get local repeaters
// @Description  Returns local amateur radio repeaters near Bossier City, LA
// @Tags         external
// @Produce      json
// @Success      200  {array}   Repeater
// @Router       /repeaters [get]
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
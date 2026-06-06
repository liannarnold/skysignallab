package handlers

import (
	"encoding/json"
	"encoding/xml"
	"io"
	"net/http"
	"strings"

	"github.com/rs/zerolog/log"
)

// ── Band Conditions (hamqsl.com) ──────────────────

type Solar struct {
	XMLName   xml.Name  `xml:"solar"`
	SolarData SolarData `xml:"solardata"`
}

type SolarData struct {
	UpdatedAt           string      `xml:"updated"`
	CalculatedConditions []BandXML  `xml:"calculatedconditions>band"`
}

type BandXML struct {
	Name      string `xml:"name,attr"`
	Time      string `xml:"time,attr"`
	Condition string `xml:",chardata"`
}

type BandCondition struct {
	Band      string `json:"band"`
	Time      string `json:"time"`
	Condition string `json:"condition"`
}

func GetBandConditions(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get("https://www.hamqsl.com/solarxml.php")
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch band conditions")
		http.Error(w, `{"error":"failed to fetch band conditions"}`, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Error().Err(err).Msg("Failed to read band conditions response")
		http.Error(w, `{"error":"failed to read response"}`, http.StatusInternalServerError)
		return
	}

	var solar Solar
	if err := xml.Unmarshal(body, &solar); err != nil {
		log.Error().Err(err).Msg("Failed to parse band conditions XML")
		http.Error(w, `{"error":"failed to parse response"}`, http.StatusInternalServerError)
		return
	}

	conditions := []BandCondition{}
	for _, band := range solar.SolarData.CalculatedConditions {
		conditions = append(conditions, BandCondition{
			Band:      band.Name,
			Time:      band.Time,
			Condition: strings.TrimSpace(band.Condition),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conditions)
}

// ── Repeaters — hardcoded Bossier City area ───────
// RepeaterBook API now requires auth — add API key later

type Repeater struct {
	Callsign  string `json:"callsign"`
	Frequency string `json:"frequency"`
	Offset    string `json:"offset"`
	PL        string `json:"pl"`
	Band      string `json:"band"`
	Location  string `json:"location"`
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
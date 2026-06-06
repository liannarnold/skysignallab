package external

import (
	"encoding/xml"
	"io"
	"net/http"
	"strings"

	"github.com/rs/zerolog/log"
)

type Solar struct {
	XMLName   xml.Name  `xml:"solar"`
	SolarData SolarData `xml:"solardata"`
}

type SolarData struct {
	CalculatedConditions []BandXML `xml:"calculatedconditions>band"`
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

func FetchBandConditions() ([]BandCondition, error) {
	resp, err := http.Get("https://www.hamqsl.com/solarxml.php")
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch band conditions")
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var solar Solar
	if err := xml.Unmarshal(body, &solar); err != nil {
		return nil, err
	}

	conditions := []BandCondition{}
	for _, band := range solar.SolarData.CalculatedConditions {
		conditions = append(conditions, BandCondition{
			Band:      band.Name,
			Time:      band.Time,
			Condition: strings.TrimSpace(band.Condition),
		})
	}

	return conditions, nil
}
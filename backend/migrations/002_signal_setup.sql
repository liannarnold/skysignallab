INSERT INTO signals (frequency, mode, description, category, band) VALUES
-- Weather
(162.4000, 'NFM', 'NOAA Weather Radio — Shreveport', 'Weather', NULL),
(162.5500, 'NFM', 'NOAA Weather Radio — alternate', 'Weather', NULL),

-- Aviation
(121.5000, 'AM', 'Aviation Emergency Frequency', 'Aviation', NULL),
(118.5000, 'AM', 'Shreveport Regional ATIS', 'Aviation', NULL),
(119.3000, 'AM', 'Shreveport Regional Tower', 'Aviation', NULL),
(125.5500, 'AM', 'Barksdale AFB Tower', 'Aviation', NULL),
(134.1000, 'AM', 'Barksdale AFB Approach', 'Aviation', NULL),

-- Marine
(156.8000, 'NFM', 'Marine VHF Channel 16 — Distress and Calling', 'Marine', NULL),
(156.3000, 'NFM', 'Marine VHF Channel 6 — Safety', 'Marine', NULL),

-- HAM
(144.2000, 'USB', 'HAM 2m SSB Calling Frequency', 'HAM', '2m'),
(146.5200, 'FM',  'HAM 2m Simplex Calling Frequency', 'HAM', '2m'),
(146.9400, 'NFM', 'W5SLA Repeater — Shreveport', 'HAM', '2m'),
(147.1800, 'NFM', 'K5BCC Repeater — Bossier City', 'HAM', '2m'),
(443.8750, 'NFM', 'KD5LJQ Repeater — Bossier City', 'HAM', '70cm'),
(146.6400, 'NFM', 'WB5MZO Repeater — Minden', 'HAM', '2m'),
(444.8500, 'NFM', 'W5BII Repeater — Shreveport', 'HAM', '70cm'),
(147.0600, 'NFM', 'K5QHD Repeater — Shreveport', 'HAM', '2m'),
(7.2900,   'LSB', '40m Traffic Net', 'HAM', '40m'),
(14.3000,  'USB', '20m SSB Calling', 'HAM', '20m'),
(3.8850,   'LSB', '80m SSB Calling', 'HAM', '80m'),

-- CB
(27.1850, 'AM', 'CB Channel 19 — Truckers', 'CB', NULL),
(27.2050, 'AM', 'CB Channel 20', 'CB', NULL),
(27.0650, 'AM', 'CB Channel 9 — Emergency', 'CB', NULL),

-- Emergency
(155.3400, 'NFM', 'Caddo Parish Fire Dispatch', 'Emergency', NULL),
(155.8350, 'NFM', 'Bossier Parish Fire Dispatch', 'Emergency', NULL),
(460.5250, 'NFM', 'Caddo Parish Police Primary', 'Emergency', NULL),
(460.4750, 'NFM', 'Bossier Parish Sheriff', 'Emergency', NULL),

-- Broadcast FM
(98.1000,  'FM', 'KBTT — Bossier City', 'Broadcast', NULL),
(94.5000,  'FM', 'KXKS — Bossier City', 'Broadcast', NULL),
(101.7000, 'FM', 'KRMD — Shreveport', 'Broadcast', NULL),
(96.5000,  'FM', 'KQHN — Shreveport', 'Broadcast', NULL),
(89.9000,  'FM', 'KDAQ — Shreveport (NPR)', 'Broadcast', NULL),
(107.3000, 'FM', 'KVKI — Shreveport', 'Broadcast', NULL),
(99.7000,  'FM', 'KRUF — Shreveport', 'Broadcast', NULL),

-- Broadcast AM
(1130, 'AM', 'KWKH — Shreveport', 'Broadcast', NULL),
(710,  'AM', 'KEEL — Shreveport', 'Broadcast', NULL),
(890,  'AM', 'KRMD AM — Shreveport', 'Broadcast', NULL);
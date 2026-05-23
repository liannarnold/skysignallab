-- Users
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    is_admin    BOOLEAN DEFAULT false,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Signals
CREATE TABLE IF NOT EXISTS signals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frequency   DECIMAL(10,4) NOT NULL,
    mode        VARCHAR(10) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    band        VARCHAR(20),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    signal_id   UUID REFERENCES signals(id) ON DELETE CASCADE,
    notes       VARCHAR(500),
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, signal_id)
);

-- User defined signals
CREATE TABLE IF NOT EXISTS user_signals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    frequency   DECIMAL(10,4) NOT NULL,
    mode        VARCHAR(10) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category    VARCHAR(50),
    band        VARCHAR(20),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Signal tags
CREATE TABLE IF NOT EXISTS signal_tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    signal_id   UUID REFERENCES signals(id) ON DELETE CASCADE,
    tag         VARCHAR(50) NOT NULL
);

-- SDR session
CREATE TABLE IF NOT EXISTS sdr_session (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    started_at  TIMESTAMP DEFAULT NOW(),
    expires_at  TIMESTAMP NOT NULL,
    last_active TIMESTAMP DEFAULT NOW()
);
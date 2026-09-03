CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    short_code VARCHAR(20) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    link_id INT REFERENCES links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT NOW(),
    device VARCHAR(50),
    browser VARCHAR(50),
    country VARCHAR(100),
    referrer VARCHAR(255)
);

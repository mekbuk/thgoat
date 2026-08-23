-- Curated Tattoo Picture Dataset for Multiplayer Game MVP

INSERT INTO pictures (id, image_url, description, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1590246814883-5783515fb27c?auto=format&fit=crop&w=800&q=80', 'A terrifyingly wonky dragon with cross-eyes and uneven wings', TRUE),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80', 'A mispelled inspirational quote that says "No Ragrets Ever"', TRUE),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80', 'A portrait of a celebrity that ended up looking like a melting potato', TRUE),
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=800&q=80', 'A hyper-realistic taco with human legs and sunglasses', TRUE),
('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80', 'A tribal dolphin giving a thumbs up wearing a top hat', TRUE)
ON CONFLICT (id) DO NOTHING;

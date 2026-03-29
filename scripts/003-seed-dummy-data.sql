-- Seed dummy data: 4 players with 15 rounds each and course reviews
-- Player 1: Pro-level golfer (scratch to low single digit handicap)
-- Player 2: Decent golfer (mid handicap)
-- Player 3: Average golfer (higher handicap)
-- Player 4: Beginner golfer (highest handicap)

-- Create 4 players (guest players with user_id = NULL so everyone can see them)
INSERT INTO players (id, name, favorite_course, user_id, created_at)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Tiger Woods Jr.', 'Augusta National', NULL, NOW()),
  ('a2222222-2222-2222-2222-222222222222', 'Sarah Fairway', 'Pebble Beach', NULL, NOW()),
  ('a3333333-3333-3333-3333-333333333333', 'Mike Mulligan', 'Torrey Pines', NULL, NOW()),
  ('a4444444-4444-4444-4444-444444444444', 'Bob Bogey', 'Happy Trails Muni', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- Player 1: Tiger Woods Jr. - Pro level (scores 68-75 on par 72)
-- Typical course: Rating 72.0, Slope 130
INSERT INTO rounds (id, player_id, course, date, rating, slope, tee, score, user_id, created_at)
VALUES
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Augusta National', '2026-03-01', 76.2, 148, 'Championship', 72, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Augusta National', '2026-03-03', 76.2, 148, 'Championship', 70, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Pebble Beach', '2026-03-05', 75.5, 145, 'Blue', 71, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Torrey Pines South', '2026-03-07', 74.6, 138, 'Blue', 69, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'TPC Sawgrass', '2026-03-09', 74.0, 135, 'Blue', 73, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Augusta National', '2026-03-11', 76.2, 148, 'Championship', 68, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Pinehurst No. 2', '2026-03-13', 75.3, 140, 'Blue', 74, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Bethpage Black', '2026-03-15', 76.6, 152, 'Black', 75, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Pebble Beach', '2026-03-17', 75.5, 145, 'Blue', 70, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Whistling Straits', '2026-03-19', 74.9, 142, 'Blue', 72, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Augusta National', '2026-03-21', 76.2, 148, 'Championship', 69, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'TPC Scottsdale', '2026-03-23', 73.5, 130, 'Blue', 71, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Kiawah Ocean Course', '2026-03-25', 75.7, 144, 'Blue', 74, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Pebble Beach', '2026-03-27', 75.5, 145, 'Blue', 68, NULL, NOW()),
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'Augusta National', '2026-03-29', 76.2, 148, 'Championship', 71, NULL, NOW());

-- Player 2: Sarah Fairway - Good golfer (scores 78-86 on par 72)
-- Handicap around 8-12
INSERT INTO rounds (id, player_id, course, date, rating, slope, tee, score, user_id, created_at)
VALUES
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Pebble Beach', '2026-03-01', 71.8, 130, 'White', 82, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Pebble Beach', '2026-03-03', 71.8, 130, 'White', 79, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Spyglass Hill', '2026-03-05', 72.5, 135, 'White', 84, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Spanish Bay', '2026-03-07', 70.5, 125, 'White', 80, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Torrey Pines North', '2026-03-09', 71.2, 128, 'White', 83, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Pebble Beach', '2026-03-11', 71.8, 130, 'White', 78, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Half Moon Bay', '2026-03-13', 70.8, 124, 'White', 81, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Pasatiempo', '2026-03-15', 72.0, 132, 'White', 85, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Pebble Beach', '2026-03-17', 71.8, 130, 'White', 80, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Poppy Hills', '2026-03-19', 71.5, 129, 'White', 82, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Pebble Beach', '2026-03-21', 71.8, 130, 'White', 79, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Carmel Valley Ranch', '2026-03-23', 70.2, 120, 'White', 78, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Spyglass Hill', '2026-03-25', 72.5, 135, 'White', 86, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Pebble Beach', '2026-03-27', 71.8, 130, 'White', 81, NULL, NOW()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'Spanish Bay', '2026-03-29', 70.5, 125, 'White', 80, NULL, NOW());

-- Player 3: Mike Mulligan - Average golfer (scores 88-98 on par 72)
-- Handicap around 16-22
INSERT INTO rounds (id, player_id, course, date, rating, slope, tee, score, user_id, created_at)
VALUES
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Torrey Pines', '2026-03-01', 70.5, 122, 'White', 92, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Torrey Pines', '2026-03-03', 70.5, 122, 'White', 89, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Balboa Park', '2026-03-05', 69.8, 118, 'White', 94, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Mission Bay', '2026-03-07', 68.5, 115, 'White', 90, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Coronado Golf', '2026-03-09', 70.2, 120, 'White', 95, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Torrey Pines', '2026-03-11', 70.5, 122, 'White', 88, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Rancho Bernardo', '2026-03-13', 71.0, 125, 'White', 96, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Maderas Golf', '2026-03-15', 71.5, 128, 'White', 98, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Torrey Pines', '2026-03-17', 70.5, 122, 'White', 91, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Aviara Golf', '2026-03-19', 72.0, 130, 'White', 97, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Torrey Pines', '2026-03-21', 70.5, 122, 'White', 90, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Steele Canyon', '2026-03-23', 70.8, 124, 'White', 93, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Mt Woodson', '2026-03-25', 69.5, 116, 'White', 91, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'Torrey Pines', '2026-03-27', 70.5, 122, 'White', 89, NULL, NOW()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'La Costa', '2026-03-29', 71.2, 126, 'White', 94, NULL, NOW());

-- Player 4: Bob Bogey - Beginner/struggling golfer (scores 100-118 on par 72)
-- Handicap around 28-36
INSERT INTO rounds (id, player_id, course, date, rating, slope, tee, score, user_id, created_at)
VALUES
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Happy Trails Muni', '2026-03-01', 68.0, 110, 'White', 105, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Happy Trails Muni', '2026-03-03', 68.0, 110, 'White', 112, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Riverside Muni', '2026-03-05', 67.5, 108, 'White', 108, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Pine Valley Par 3', '2026-03-07', 65.0, 100, 'White', 102, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Oak Meadows', '2026-03-09', 68.5, 112, 'White', 115, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Happy Trails Muni', '2026-03-11', 68.0, 110, 'White', 100, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Shady Oaks', '2026-03-13', 67.0, 105, 'White', 110, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Willow Creek', '2026-03-15', 68.2, 111, 'White', 118, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Happy Trails Muni', '2026-03-17', 68.0, 110, 'White', 106, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Sunset Ridge', '2026-03-19', 67.8, 109, 'White', 113, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Happy Trails Muni', '2026-03-21', 68.0, 110, 'White', 104, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Lakeside Muni', '2026-03-23', 67.2, 106, 'White', 109, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Meadow Brook', '2026-03-25', 66.5, 102, 'White', 107, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Happy Trails Muni', '2026-03-27', 68.0, 110, 'White', 102, NULL, NOW()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'Rolling Hills', '2026-03-29', 68.8, 113, 'White', 116, NULL, NOW());

-- Course Reviews from each player
-- We need round IDs for the reviews, so let's create reviews without round_id first
-- Since course_reviews has round_id as optional based on the schema

-- Tiger Woods Jr. reviews (thoughtful pro perspective)
INSERT INTO course_reviews (id, course_name, overall_rating, difficulty_rating, review_text, weather, user_id, created_at)
VALUES
  (gen_random_uuid(), 'Augusta National', 5, 5, 'Absolutely pristine conditions. The greens are lightning fast and every hole presents a unique challenge. Amen Corner is as demanding as advertised. A true test of championship golf.', 'Sunny, 75°F', NULL, NOW()),
  (gen_random_uuid(), 'Pebble Beach', 5, 4, 'The ocean views are breathtaking and the course design is timeless. Holes 7, 8, and 18 are iconic. Wind can make this course play very differently day to day.', 'Partly cloudy, 65°F', NULL, NOW()),
  (gen_random_uuid(), 'Bethpage Black', 5, 5, 'The warning sign at the first tee is no joke. This course will humble you. Excellent public course that rivals any private club. Just bring your A-game.', 'Overcast, 58°F', NULL, NOW());

-- Sarah Fairway reviews (enthusiastic club golfer)
INSERT INTO course_reviews (id, course_name, overall_rating, difficulty_rating, review_text, weather, user_id, created_at)
VALUES
  (gen_random_uuid(), 'Pebble Beach', 5, 4, 'A bucket list course that lived up to the hype! The scenery is unreal and the staff made us feel like pros. Worth every penny for a once-in-a-lifetime experience.', 'Sunny, 68°F', NULL, NOW()),
  (gen_random_uuid(), 'Spyglass Hill', 4, 4, 'More challenging than Pebble in my opinion. The first five holes through the dunes are incredible. Back nine is more traditional but still excellent.', 'Foggy morning, clearing', NULL, NOW()),
  (gen_random_uuid(), 'Spanish Bay', 4, 3, 'Beautiful links-style course with amazing sunset views. More forgiving than its neighbors. The bagpiper at sunset is a wonderful tradition.', 'Clear, 62°F', NULL, NOW());

-- Mike Mulligan reviews (honest weekend warrior)
INSERT INTO course_reviews (id, course_name, overall_rating, difficulty_rating, review_text, weather, user_id, created_at)
VALUES
  (gen_random_uuid(), 'Torrey Pines', 4, 4, 'Great value for a municipal course. South course kicked my butt but the views of the Pacific make every lost ball worth it. Book tee times early!', 'Perfect San Diego weather', NULL, NOW()),
  (gen_random_uuid(), 'Balboa Park', 3, 3, 'Solid municipal course right in the city. Gets crowded on weekends but pace was okay. Good place to practice before tackling Torrey.', 'Sunny, 72°F', NULL, NOW()),
  (gen_random_uuid(), 'Maderas Golf', 4, 4, 'Hidden gem in north county. The elevation changes are killer on the legs but the course is in great shape. Watch out for the canyon carries.', 'Warm, 80°F', NULL, NOW());

-- Bob Bogey reviews (struggling but having fun)
INSERT INTO course_reviews (id, course_name, overall_rating, difficulty_rating, review_text, weather, user_id, created_at)
VALUES
  (gen_random_uuid(), 'Happy Trails Muni', 4, 2, 'My home course! Staff knows me by name at this point. Not fancy but well maintained and very affordable. Perfect for high handicappers learning the game.', 'Nice and calm', NULL, NOW()),
  (gen_random_uuid(), 'Pine Valley Par 3', 5, 1, 'Great course for beginners or working on your short game. No pressure environment and you can play a quick round after work. Highly recommend!', 'Sunny', NULL, NOW()),
  (gen_random_uuid(), 'Oak Meadows', 3, 3, 'A bit too hard for me honestly. Lost a sleeve of balls on the back nine. Course is nice though, maybe I will come back when I improve.', 'Windy, 68°F', NULL, NOW()),
  (gen_random_uuid(), 'Willow Creek', 2, 3, 'Course was in rough shape when I played. Several bare patches in the fairways. Maybe just bad timing but hard to recommend at full price.', 'Hot, 88°F', NULL, NOW());

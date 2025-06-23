-- Remove detailed mood tracking enhancements
ALTER TABLE mood_entries DROP COLUMN secondary_mood;
ALTER TABLE mood_entries DROP COLUMN energy_level;
ALTER TABLE mood_entries DROP COLUMN stress_level;
ALTER TABLE mood_entries DROP COLUMN location;
ALTER TABLE mood_entries DROP COLUMN weather;
ALTER TABLE mood_entries DROP COLUMN context_tags;

DROP TABLE mood_entry_triggers;
DROP TABLE mood_triggers;
DROP TABLE custom_moods;
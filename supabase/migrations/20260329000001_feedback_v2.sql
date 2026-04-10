-- Add anonymous posting + author name + image support to feedback_items
ALTER TABLE feedback_items
    ADD COLUMN is_anonymous boolean NOT NULL DEFAULT true,
    ADD COLUMN author_name  text,
    ADD COLUMN image_url    text;

-- Storage bucket for feedback media (public read, auth write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'feedback-media',
    'feedback-media',
    true,
    10485760,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
);

CREATE POLICY "Authenticated users can upload feedback media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-media');

CREATE POLICY "Public can read feedback media"
ON storage.objects FOR SELECT
USING (bucket_id = 'feedback-media');

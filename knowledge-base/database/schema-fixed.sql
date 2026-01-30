-- ============================================
-- BAZA WIEDZY - DZIAŁ TECHNICZNY
-- Schemat bazy danych dla Supabase (PostgreSQL)
-- ============================================

-- Włączenie rozszerzeń
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TABELA: users (użytkownicy)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: categories (kategorie - struktura drzewiasta)
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- TABELA: topics (tematy)
-- ============================================
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_topics_category ON topics(category_id);
CREATE INDEX idx_topics_created_by ON topics(created_by);
CREATE INDEX idx_topics_created_at ON topics(created_at DESC);

-- ============================================
-- TABELA: notes (notatki)
-- ============================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'html', 'plain')),
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(content, '')), 'B')
    ) STORED
);

CREATE INDEX idx_notes_topic ON notes(topic_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);
CREATE INDEX idx_notes_content_trgm ON notes USING GIN(content gin_trgm_ops);

-- ============================================
-- TABELA: tags (tagi)
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);

-- ============================================
-- TABELA: note_tags (powiązanie notatek z tagami)
-- ============================================
CREATE TABLE note_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_note_tags_tag ON note_tags(tag_id);

-- ============================================
-- TABELA: topic_tags (powiązanie tematów z tagami)
-- ============================================
CREATE TABLE topic_tags (
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (topic_id, tag_id)
);

CREATE INDEX idx_topic_tags_tag ON topic_tags(tag_id);

-- ============================================
-- TABELA: attachments (załączniki)
-- ============================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(255),
    thumbnail_path TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attachments_note ON attachments(note_id);

-- ============================================
-- TABELA: note_links (powiązania między notatkami)
-- ============================================
CREATE TABLE note_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    target_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    link_type VARCHAR(50) DEFAULT 'reference' CHECK (link_type IN ('reference', 'related', 'parent', 'child')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_notes CHECK (source_note_id != target_note_id),
    UNIQUE(source_note_id, target_note_id)
);

CREATE INDEX idx_note_links_source ON note_links(source_note_id);
CREATE INDEX idx_note_links_target ON note_links(target_note_id);

-- ============================================
-- TABELA: note_history (historia zmian notatek)
-- ============================================
CREATE TABLE note_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content TEXT NOT NULL,
    changed_by UUID REFERENCES users(id),
    change_type VARCHAR(50) DEFAULT 'edit' CHECK (change_type IN ('create', 'edit', 'restore')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_note_history_note ON note_history(note_id);
CREATE INDEX idx_note_history_created ON note_history(created_at DESC);

-- ============================================
-- TABELA: favorites (ulubione)
-- ============================================
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

-- ============================================
-- TABELA: recent_views (ostatnio przeglądane)
-- ============================================
CREATE TABLE recent_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_recent_views_user ON recent_views(user_id, viewed_at DESC);

-- ============================================
-- WIDOKI (Views)
-- ============================================
CREATE VIEW topics_with_stats AS
SELECT 
    t.*,
    u.full_name as author_name,
    u.avatar_url as author_avatar,
    c.name as category_name,
    c.color as category_color,
    COUNT(DISTINCT n.id) as notes_count,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)) 
        FILTER (WHERE tg.id IS NOT NULL), 
        '[]'
    ) as tags
FROM topics t
LEFT JOIN users u ON t.created_by = u.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN notes n ON n.topic_id = t.id
LEFT JOIN topic_tags tt ON tt.topic_id = t.id
LEFT JOIN tags tg ON tt.tag_id = tg.id
GROUP BY t.id, u.full_name, u.avatar_url, c.name, c.color;

-- ============================================
-- FUNKCJE
-- ============================================
CREATE OR REPLACE FUNCTION search_notes(search_query TEXT)
RETURNS TABLE (
    note_id UUID,
    topic_id UUID,
    title VARCHAR(500),
    content_preview TEXT,
    rank REAL,
    category_name VARCHAR(255),
    topic_title VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id as note_id,
        n.topic_id,
        n.title,
        LEFT(n.content, 200) as content_preview,
        ts_rank(n.search_vector, plainto_tsquery('simple', search_query)) as rank,
        c.name as category_name,
        t.title as topic_title
    FROM notes n
    JOIN topics t ON n.topic_id = t.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE n.search_vector @@ plainto_tsquery('simple', search_query)
       OR n.content ILIKE '%' || search_query || '%'
       OR n.title ILIKE '%' || search_query || '%'
    ORDER BY rank DESC, n.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_category_tree()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    parent_id UUID,
    level INTEGER,
    path TEXT
) AS $$
WITH RECURSIVE category_tree AS (
    SELECT 
        c.id, c.name, c.description, c.icon, c.color, c.parent_id,
        0 as level,
        c.name::TEXT as path
    FROM categories c
    WHERE c.parent_id IS NULL
    UNION ALL
    SELECT 
        c.id, c.name, c.description, c.icon, c.color, c.parent_id,
        ct.level + 1,
        ct.path || ' > ' || c.name
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION save_note_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO note_history (note_id, title, content, changed_by, change_type)
        VALUES (OLD.id, OLD.title, OLD.content, NEW.created_by, 'edit');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_save_note_history
    BEFORE UPDATE ON notes
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title)
    EXECUTE FUNCTION save_note_history();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_views ENABLE ROW LEVEL SECURITY;

-- Polityki: Wszyscy zalogowani mogą czytać
CREATE POLICY "Authenticated users can read all" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read categories" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read topics" ON topics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read notes" ON notes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read tags" ON tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read note_tags" ON note_tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read topic_tags" ON topic_tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read attachments" ON attachments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read note_links" ON note_links FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read note_history" ON note_history FOR SELECT USING (auth.role() = 'authenticated');

-- Polityki: Zalogowani mogą tworzyć i edytować
CREATE POLICY "Authenticated users can insert topics" ON topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update topics" ON topics FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert notes" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update notes" ON notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert tags" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert note_tags" ON note_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete note_tags" ON note_tags FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert topic_tags" ON topic_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete topic_tags" ON topic_tags FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert attachments" ON attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert note_links" ON note_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete note_links" ON note_links FOR DELETE USING (auth.role() = 'authenticated');

-- Polityki: Ulubione i ostatnio przeglądane
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recent_views" ON recent_views FOR ALL USING (auth.uid() = user_id);

-- Polityka: Wszyscy zalogowani mogą zarządzać kategoriami
CREATE POLICY "Authenticated users can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DANE PRZYKŁADOWE
-- ============================================
INSERT INTO categories (name, description, icon, color) VALUES
('Zegarki', 'Dokumentacja zegarków smartwatch', 'watch', '#3B82F6'),
('Lokalizatory', 'Dokumentacja lokalizatorów GPS', 'map-pin', '#10B981'),
('Firmware', 'Oprogramowanie urządzeń', 'cpu', '#8B5CF6'),
('Hardware', 'Komponenty sprzętowe', 'circuit-board', '#F59E0B'),
('Procedury', 'Procedury i instrukcje', 'clipboard-list', '#EF4444'),
('Logi i błędy', 'Dokumentacja logów i rozwiązań błędów', 'bug', '#EC4899');

INSERT INTO tags (name, color) VALUES
('pilne', '#EF4444'),
('do-weryfikacji', '#F59E0B'),
('rozwiązane', '#10B981'),
('bluetooth', '#3B82F6'),
('gps', '#8B5CF6'),
('bateria', '#6366F1'),
('ekran', '#EC4899'),
('czujniki', '#14B8A6');

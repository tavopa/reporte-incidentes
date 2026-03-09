-- Enable pgvector for vector similarity search (embeddings / semantic memory)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

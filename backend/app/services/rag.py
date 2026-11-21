import re
import math
from pathlib import Path
from typing import List, Dict, Any
from app.config import settings

class RAGDocumentChunk:
    def __init__(self, source: str, title: str, content: str):
        self.source = source
        self.title = title
        self.content = content
        self.tokens = self._tokenize(f"{title} {content}")

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', text.lower())
        stopwords = {
            "the", "and", "for", "with", "this", "that", "from", "are", "was",
            "were", "will", "have", "has", "had", "not", "can", "should", "you",
            "your", "our", "all", "any", "which", "when", "where", "into", "more"
        }
        return [w for w in words if w not in stopwords]

class KnowledgeBaseRetriever:
    def __init__(self, kb_path: Path):
        self.kb_path = kb_path
        self.chunks: List[RAGDocumentChunk] = []
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        self.chunks.clear()
        if not self.kb_path.exists():
            return
            
        for file in self.kb_path.glob("*.md"):
            try:
                text = file.read_text(encoding="utf-8")
                # Split by ## markdown headers
                sections = re.split(r'\n(?=##\s+)', text)
                doc_title = file.stem.replace("_", " ").title()
                
                for idx, sec in enumerate(sections):
                    lines = sec.strip().split("\n")
                    if not lines or not lines[0]:
                        continue
                    sec_title = lines[0].replace("#", "").strip() or f"{doc_title} Section {idx+1}"
                    sec_content = "\n".join(lines[1:]).strip() if len(lines) > 1 else sec
                    if len(sec_content) > 30:
                        self.chunks.append(
                            RAGDocumentChunk(
                                source=f"kb/{file.name}",
                                title=sec_title,
                                content=sec_content
                            )
                        )
            except Exception:
                continue

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks:
            self._load_knowledge_base()
            
        q_tokens = re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', query.lower())
        if not q_tokens:
            return []

        scored_chunks = []
        for chunk in self.chunks:
            # Token frequency match
            score = 0.0
            chunk_token_set = set(chunk.tokens)
            for qt in q_tokens:
                if qt in chunk_token_set:
                    # Count frequency
                    tf = chunk.tokens.count(qt)
                    score += 1.0 + math.log(1.0 + tf)
                    if qt in chunk.title.lower():
                        score += 3.0  # title match bonus
            
            if score > 0.0:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, ch in scored_chunks[:top_k]:
            results.append({
                "source": ch.source,
                "title": ch.title,
                "content": ch.content,
                "relevance_score": round(score, 2)
            })
        return results

retriever = KnowledgeBaseRetriever(settings.knowledge_base_path)

"""
Tealigence — Vector Database Initialization Script

Reads all .txt files from the /documents folder,
splits them into chunks, embeds using HuggingFace all-MiniLM-L6-v2,
and stores in a persistent ChromaDB instance.

Usage:
    python init_db.py
"""

import os
import glob
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import SKLearnVectorStore

# Paths
DOCUMENTS_DIR = os.path.join(os.path.dirname(__file__), "documents")
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db") # Kept same dir name for simplicity
DB_FILE = os.path.join(CHROMA_DB_DIR, "vectorstore.json")


def main():
    print("=" * 60)
    print("🍵 Tealigence — Vector Database Initialization")
    print("=" * 60)

    # 1. Find all .txt files in documents/
    txt_files = glob.glob(os.path.join(DOCUMENTS_DIR, "*.txt"))

    if not txt_files:
        print(f"\n⚠️  No .txt files found in {DOCUMENTS_DIR}")
        print("   Please add your documents (e.g., tocklai_guidelines.txt) and re-run.")
        return

    print(f"\n📄 Found {len(txt_files)} document(s):")
    for f in txt_files:
        print(f"   - {os.path.basename(f)}")

    # 2. Load all documents
    all_docs = []
    for file_path in txt_files:
        try:
            loader = TextLoader(file_path, encoding="utf-8")
            docs = loader.load()
            all_docs.extend(docs)
            print(f"   ✅ Loaded: {os.path.basename(file_path)} ({len(docs[0].page_content)} chars)")
        except Exception as e:
            print(f"   ❌ Error loading {os.path.basename(file_path)}: {e}")

    if not all_docs:
        print("\n❌ No documents were successfully loaded.")
        return

    # 3. Split into chunks
    print(f"\n✂️  Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = text_splitter.split_documents(all_docs)
    print(f"   Created {len(chunks)} chunks")

    # 4. Create embeddings
    print(f"\n🧠 Loading embedding model (all-MiniLM-L6-v2)...")
    print("   (This may take a minute on first run as it downloads the model)")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
    )

    # 5. Store in SKLearnVectorStore
    print(f"\n💾 Storing embeddings using Scikit-Learn at {CHROMA_DB_DIR}...")

    os.makedirs(CHROMA_DB_DIR, exist_ok=True)

    vectorstore = SKLearnVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_path=DB_FILE,
        serializer="json"
    )
    vectorstore.persist()

    # Verify
    print(f"\n✅ Success! Stored {len(chunks)} chunks in vector database.")
    print(f"   Database location: {DB_FILE}")

    # Test query
    print(f"\n🔍 Test query: 'tea cultivation best practices'")
    results = vectorstore.similarity_search("tea cultivation best practices", k=3)
    for i, doc in enumerate(results):
        preview = doc.page_content[:100].replace("\n", " ")
        print(f"   Result {i+1}: {preview}...")

    print(f"\n{'=' * 60}")
    print("🍵 Vector database ready! You can now start the backend.")
    print("=" * 60)


if __name__ == "__main__":
    main()

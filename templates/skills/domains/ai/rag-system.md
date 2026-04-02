---
name: rag-system
description: RAG 檢索增強生成架構。向量資料庫、Embedding、檢索策略、重排演算法、混合檢索。當使用者提到 RAG、檢索增強、向量資料庫、Embedding、重排、LangChain、LlamaIndex 時使用。
---

# 🔮 丹鼎秘典 · RAG 系統 (Retrieval-Augmented Generation)

## RAG 架構

```
查詢 → Embedding → 向量檢索 → 重排 → 上下文注入 → LLM 生成
  │         │           │         │          │            │
  └─ 改寫 ──┴─ 混合檢索 ─┴─ 相關性 ─┴─ 壓縮 ──┴─ 答案 + 引用
```

### 核心流程
```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

# 1. 文件載入與切分
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

loader = TextLoader("docs.txt")
documents = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", "。", ".", " "]
)
chunks = splitter.split_documents(documents)

# 2. 向量化與儲存
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(chunks, embeddings)

# 3. 檢索與生成
llm = ChatOpenAI(model="gpt-4", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True
)

result = qa_chain({"query": "什麼是 RAG？"})
print(result["result"])
```

## 向量資料庫對比

| 資料庫 | 型別 | 索引演算法 | 適用場景 | 部署 |
|--------|------|----------|----------|------|
| Pinecone | 託管 | HNSW | 生產級、高併發 | 雲端 |
| Weaviate | 開源 | HNSW | 多模態、GraphQL | 自託管/雲 |
| Qdrant | 開源 | HNSW | 高效能、過濾 | 自託管/雲 |
| Chroma | 開源 | HNSW | 快速原型、本地 | 本地/記憶體 |
| Milvus | 開源 | IVF/HNSW | 大規模、分散式 | 自託管 |
| Faiss | 庫 | IVF/PQ | 研究、離線 | 本地 |

### Pinecone 示例
```python
import pinecone
from langchain.vectorstores import Pinecone

pinecone.init(api_key="YOUR_KEY", environment="us-west1-gcp")

index_name = "rag-index"
if index_name not in pinecone.list_indexes():
    pinecone.create_index(
        name=index_name,
        dimension=1536,  # OpenAI ada-002
        metric="cosine"
    )

vectorstore = Pinecone.from_documents(
    documents=chunks,
    embedding=embeddings,
    index_name=index_name
)
```

### Qdrant 示例
```python
from qdrant_client import QdrantClient
from langchain.vectorstores import Qdrant

client = QdrantClient(host="localhost", port=6333)

vectorstore = Qdrant.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="knowledge_base",
    client=client
)

# 帶過濾的檢索
results = vectorstore.similarity_search(
    query="RAG 架構",
    k=5,
    filter={"source": "technical_docs"}
)
```

## Embedding 模型選擇

### 模型對比
| 模型 | 維度 | 效能 | 成本 | 適用場景 |
|------|------|------|------|----------|
| OpenAI ada-002 | 1536 | 高 | 中 | 通用、多語言 |
| Cohere embed-v3 | 1024 | 高 | 中 | 多語言、壓縮 |
| BGE-large-zh | 1024 | 高 | 免費 | 中文最佳化 |
| E5-large-v2 | 1024 | 中 | 免費 | 開源、通用 |
| text2vec-base | 768 | 中 | 免費 | 中文、輕量 |

### 本地 Embedding
```python
from langchain.embeddings import HuggingFaceEmbeddings

# BGE 中文模型
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",
    model_kwargs={'device': 'cuda'},
    encode_kwargs={'normalize_embeddings': True}
)

# 批次編碼
texts = ["文件1", "文件2", "文件3"]
vectors = embeddings.embed_documents(texts)

# 查詢編碼（帶指令）
query_vector = embeddings.embed_query("為這個句子生成表示")
```

### 多模態 Embedding
```python
from langchain.embeddings import OpenAIEmbeddings

# CLIP 圖文聯合
class MultiModalEmbedding:
    def __init__(self):
        self.text_model = OpenAIEmbeddings()
        self.image_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")

    def embed_image(self, image_path: str):
        image = Image.open(image_path)
        return self.image_model.encode_image(image)

    def embed_text(self, text: str):
        return self.text_model.embed_query(text)
```

## 檢索策略

### Dense 檢索（向量）
```python
# 餘弦相似度檢索
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
)

# MMR（最大邊際相關性）- 多樣性
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "fetch_k": 20, "lambda_mult": 0.5}
)

# 相似度閾值過濾
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.8, "k": 5}
)
```

### Sparse 檢索（BM25）
```python
from langchain.retrievers import BM25Retriever

# BM25 關鍵詞檢索
bm25_retriever = BM25Retriever.from_documents(chunks)
bm25_retriever.k = 5

results = bm25_retriever.get_relevant_documents("RAG 系統")
```

### Hybrid 混合檢索
```python
from langchain.retrievers import EnsembleRetriever

# 向量 + BM25 混合
ensemble_retriever = EnsembleRetriever(
    retrievers=[vectorstore.as_retriever(), bm25_retriever],
    weights=[0.6, 0.4]  # 向量權重 60%，BM25 權重 40%
)

results = ensemble_retriever.get_relevant_documents("查詢")
```

### 多路召回
```python
class MultiRecallRetriever:
    def __init__(self, vector_store, bm25_retriever, graph_retriever):
        self.retrievers = {
            "vector": vector_store.as_retriever(search_kwargs={"k": 10}),
            "bm25": bm25_retriever,
            "graph": graph_retriever
        }

    def retrieve(self, query: str, top_k: int = 5):
        all_docs = []
        for name, retriever in self.retrievers.items():
            docs = retriever.get_relevant_documents(query)
            all_docs.extend([(doc, name) for doc in docs])

        # 去重 + 重排
        unique_docs = self._deduplicate(all_docs)
        return self._rerank(unique_docs, query)[:top_k]
```

## 重排演算法

### Cross-Encoder 重排
```python
from sentence_transformers import CrossEncoder

class Reranker:
    def __init__(self):
        self.model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    def rerank(self, query: str, documents: list, top_k: int = 5):
        pairs = [[query, doc.page_content] for doc in documents]
        scores = self.model.predict(pairs)

        # 按分數排序
        ranked = sorted(zip(documents, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, score in ranked[:top_k]]

# 使用
reranker = Reranker()
initial_docs = vectorstore.similarity_search(query, k=20)
final_docs = reranker.rerank(query, initial_docs, top_k=5)
```

### Cohere Rerank API
```python
import cohere

co = cohere.Client("YOUR_API_KEY")

def cohere_rerank(query: str, documents: list, top_k: int = 5):
    results = co.rerank(
        query=query,
        documents=[doc.page_content for doc in documents],
        top_n=top_k,
        model="rerank-multilingual-v2.0"
    )

    return [documents[r.index] for r in results]
```

### LLM 重排
```python
from langchain.chat_models import ChatOpenAI

def llm_rerank(query: str, documents: list, top_k: int = 3):
    llm = ChatOpenAI(model="gpt-4", temperature=0)

    prompt = f"""給定查詢和文件列表，按相關性排序（1最相關）。

查詢: {query}

文件:
{chr(10).join([f"{i+1}. {doc.page_content[:200]}" for i, doc in enumerate(documents)])}

輸出格式: 1,3,2,5,4（僅數字和逗號）"""

    ranking = llm.predict(prompt).strip().split(',')
    return [documents[int(i)-1] for i in ranking[:top_k]]
```

## 文件切分策略

### 遞迴切分
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", "。", ".", " ", ""]
)
```

### 語義切分
```python
from langchain.text_splitter import SemanticChunker

semantic_splitter = SemanticChunker(
    embeddings=embeddings,
    breakpoint_threshold_type="percentile",  # 或 "standard_deviation"
    breakpoint_threshold_amount=95
)

chunks = semantic_splitter.split_text(long_text)
```

### Markdown 結構化切分
```python
from langchain.text_splitter import MarkdownHeaderTextSplitter

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]

markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)
chunks = markdown_splitter.split_text(markdown_text)
```

## 查詢最佳化

### 查詢改寫
```python
from langchain.prompts import ChatPromptTemplate

query_rewrite_prompt = ChatPromptTemplate.from_template("""
將使用者查詢改寫為更適合檢索的形式。

原始查詢: {query}

改寫要求:
1. 補全省略資訊
2. 擴充套件同義詞
3. 拆分複合問題

改寫後查詢:""")

def rewrite_query(query: str):
    chain = query_rewrite_prompt | llm
    return chain.invoke({"query": query}).content
```

### 多查詢生成
```python
from langchain.retrievers.multi_query import MultiQueryRetriever

multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=llm
)

# 自動生成 3-5 個變體查詢
results = multi_query_retriever.get_relevant_documents("RAG 是什麼？")
```

### HyDE（假設文件嵌入）
```python
def hyde_retrieval(query: str):
    # 1. 讓 LLM 生成假設答案
    hyde_prompt = f"請詳細回答: {query}"
    hypothetical_doc = llm.predict(hyde_prompt)

    # 2. 用假設答案檢索
    results = vectorstore.similarity_search(hypothetical_doc, k=5)
    return results
```

## 上下文壓縮

### LLM 壓縮器
```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

compressor = LLMChainExtractor.from_llm(llm)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 10})
)

# 檢索 10 個文件，壓縮後返回最相關片段
compressed_docs = compression_retriever.get_relevant_documents(query)
```

### Embedding 過濾
```python
from langchain.retrievers.document_compressors import EmbeddingsFilter

embeddings_filter = EmbeddingsFilter(
    embeddings=embeddings,
    similarity_threshold=0.76
)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=embeddings_filter,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 20})
)
```

## 完整 RAG Pipeline

### LangChain 實現
```python
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

# 記憶
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    output_key="answer"
)

# 對話式 RAG
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    memory=memory,
    return_source_documents=True,
    verbose=True
)

# 多輪對話
result1 = qa_chain({"question": "什麼是 RAG？"})
result2 = qa_chain({"question": "它有什麼優勢？"})  # 自動引用上下文
```

### LlamaIndex 實現
```python
from llama_index import VectorStoreIndex, ServiceContext
from llama_index.llms import OpenAI
from llama_index.embeddings import OpenAIEmbedding

# 服務上下文
service_context = ServiceContext.from_defaults(
    llm=OpenAI(model="gpt-4", temperature=0),
    embed_model=OpenAIEmbedding()
)

# 構建索引
index = VectorStoreIndex.from_documents(
    documents,
    service_context=service_context
)

# 查詢引擎
query_engine = index.as_query_engine(
    similarity_top_k=5,
    response_mode="compact"  # 或 "tree_summarize", "refine"
)

response = query_engine.query("什麼是 RAG？")
print(response.response)
print(response.source_nodes)  # 引用來源
```

## 高階 RAG 模式

### Self-RAG（自我反思）
```python
class SelfRAG:
    def __init__(self, llm, retriever):
        self.llm = llm
        self.retriever = retriever

    def query(self, question: str):
        # 1. 判斷是否需要檢索
        need_retrieval = self._check_retrieval_need(question)

        if not need_retrieval:
            return self.llm.predict(question)

        # 2. 檢索
        docs = self.retriever.get_relevant_documents(question)

        # 3. 生成答案
        answer = self._generate_with_docs(question, docs)

        # 4. 自我評估
        if self._verify_answer(question, answer, docs):
            return answer
        else:
            # 重新檢索或生成
            return self._fallback_generate(question)
```

### RAPTOR（遞迴摘要）
```python
from langchain.chains.summarize import load_summarize_chain

def raptor_indexing(documents, levels=3):
    current_docs = documents
    all_summaries = []

    for level in range(levels):
        # 聚類
        clusters = cluster_documents(current_docs, n_clusters=10)

        # 每個簇生成摘要
        summaries = []
        for cluster in clusters:
            summary = summarize_chain.run(cluster)
            summaries.append(summary)

        all_summaries.extend(summaries)
        current_docs = summaries

    # 索引原文件 + 各層摘要
    vectorstore.add_documents(documents + all_summaries)
```

## 工具與框架

| 工具 | 型別 | 特點 |
|------|------|------|
| LangChain | 框架 | 生態豐富、元件化 |
| LlamaIndex | 框架 | 索引最佳化、查詢引擎 |
| Haystack | 框架 | 生產級、Pipeline |
| Pinecone | 向量庫 | 託管、高效能 |
| Qdrant | 向量庫 | 開源、過濾強 |
| Weaviate | 向量庫 | 多模態、GraphQL |
| Cohere | API | Embedding + Rerank |

## 最佳實踐

- ✅ 文件切分：chunk_size 500-1500，overlap 10-20%
- ✅ 檢索數量：初召回 10-20，重排後 3-5
- ✅ 混合檢索：向量 + BM25 權重 6:4 或 7:3
- ✅ 後設資料過濾：時間、來源、型別
- ✅ 引用來源：返回 source_documents
- ✅ 快取：相同查詢快取結果
- ✅ 監控：檢索延遲、相關性、答案質量
- ❌ 避免：chunk 過大/過小、無重排、無壓縮

---

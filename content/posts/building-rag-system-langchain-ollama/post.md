# بناء نظام RAG محلي للاستعلام عن المستندات باستخدام LangChain و Ollama

تعد تقنية **RAG (Retrieval-Augmented Generation)** من أهم الابتكارات في عالم الذكاء الاصطناعي الحالي، حيث تتيح للنماذج اللغوية الضخمة (LLMs) الإجابة على الأسئلة المستندة إلى ملفاتك ومستنداتك الخاصة (مثل ملفات PDF، الكتب، أو قواعد المعرفة) بدقة متناهية ودون اختلاق حقائق (Hallucinations).

في هذا الدليل التفصيلي من **Bouiba Academy**، ستتعلم كيفية بناء نظام RAG محلي بالكامل على جهازك باستخدام **LangChain** و **Ollama** و **ChromaDB** مجاناً وبدون الحاجة لإرسال بياناتك الحساسة إلى خوادم خارجية.

---

## المكونات الأساسية لنظام RAG المحلي

1. **Document Loader:** لقراءة وتجزيء ملفات PDF أو النصوص.
2. **Text Splitter:** لتقسيم المستند إلى مقاطع صغيرة (Chunks) قابلة للمعالجة.
3. **Embedding Model:** لاستخراج المتجهات السيمانتكية (Vector Embeddings) باستخدام Ollama (`nomic-embed-text`).
4. **Vector Database:** قاعرة بيانات متجهات مثل **ChromaDB** لتخزين واسترجاع مقاطع النص المشابهة.
5. **LLM:** نموذج لغوي محلي مثل `Llama 3` أو `DeepSeek-R1` عبر Ollama لتوليد الإجابات المعتمدة على السرد المعطى.

---

## الخطوات التنفيذية بالأكواد (Python)

### 1. تثبيت المكتبات المطلوبة

```bash
pip install langchain langchain-community langchain-ollama chromadb pypdf
```

### 2. تجهيز النموذج وقاعدة المتجهات

أنشئ ملف `app.py` واكتب الكود التالي:

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_community.vectorstores import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# 1. تحميل ملف الـ PDF
loader = PyPDFLoader("my_document.pdf")
docs = loader.load()

# 2. تقسيم النص إلى أجزاء
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)

# 3. إنشاء المتجهات وتخزينها في ChromaDB محلياً
embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 4. تهيئة نموذج الذكاء الاصطناعي المحلي
llm = ChatOllama(model="llama3", temperature=0.2)

# 5. تصميم الـ Prompt الخاص بنظام RAG
system_prompt = (
    "أنت مساعد تقني ذكي. أجب على السؤال التالي بناءً على السياق المرفق فقط.\n"
    "إذا لم تكن الإجابة موجودة في السياق، اذكر بوضوح أن المعلومة غير متوفرة في المستند.\n\n"
    "Context:\n{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# 6. تشغيل سلاسل LangChain
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

# 7. طرح سؤال واسترجاع الإجابة
response = rag_chain.invoke({"input": "ما هي النقاط الرئيسية المذكورة في التقرير؟"})
print("الإجابة:\n", response["answer"])
```

---

## فوائد النظام المحلي 100%

- **أمان وخصوصية تامة:** بياناتك وملفاتك لا تغادر جهازك أو سيرفر شركتك نهائياً.
- **صفر تكاليف (Zero API Costs):** لا توجد رسوم اشتراك شهرية أو تكاليف استهلاك الـ Tokens.
- **سرعة استجابة فائقة:** عدم الاعتماد على الاتصال بالإنترنت أو التأخير الشبكي.

---

## الأسئلة الشائعة (FAQ)

### ما هي المتطلبات الأجود لتشغيل هذا النظام؟

يكفي وجود معالج حديث ورام 16GB أو كارت شاشة Nvidia بـ 6GB VRAM على الأقل للحصول على سرعة استجابة ممتازة.

### هل يدعم النظام اللغة العربية؟

نعم، نموذج `nomic-embed-text` والشرائح الحديثة مثل `Llama 3` و `DeepSeek` تدعم استخراج المتجهات والفهم العربي بكفاءة عالية.

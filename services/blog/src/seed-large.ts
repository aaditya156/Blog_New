import mongoose from "mongoose";
import dotenv from "dotenv";
import { Blog, IBlog } from "./model/Blog";
import { generateEmbedding } from "./utils/embeddings";
import { getBlogCollection } from "./utils/chroma";

dotenv.config();

// Configuration
const rawMongoUri =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_read_db";
// If running directly on the host machine outside Docker, map 'mongo' container host to 127.0.0.1
const MONGO_URI = rawMongoUri.replace("//mongo:", "//127.0.0.1:");

// If running directly on host, point CHROMA_URL to host-mapped port 8005
if (!process.env.CHROMA_URL || process.env.CHROMA_URL.includes("chromadb:8000")) {
  process.env.CHROMA_URL = "http://127.0.0.1:8005";
}

const TOTAL_POSTS = 200;
const BATCH_SIZE = 50;

interface AuthorSeed {
  authorId: string;
  authorName: string;
  authorAvatar: string;
}

// 1. Author Pool (25 Unique Authors)
const AUTHORS: AuthorSeed[] = [
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Alex Rivera",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Sophia Chen",
    authorAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Marcus Vance",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Elena Rostova",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Liam O'Connor",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Amina Al-Mansoor",
    authorAvatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "David Kim",
    authorAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Priya Sharma",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Lucas Silva",
    authorAvatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Emma Watson",
    authorAvatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Hiroshi Tanaka",
    authorAvatar:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Mateo Garcia",
    authorAvatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Olga Ivanova",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Daniel Foster",
    authorAvatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Fatima Zahra",
    authorAvatar:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Ethan Wright",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Chloe Bennett",
    authorAvatar:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Arjun Patel",
    authorAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Isabella Rossi",
    authorAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Vikram Malhotra",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Zoe Saldana",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Kavita Rao",
    authorAvatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Nathan Drake",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    authorId: new mongoose.Types.ObjectId().toString(),
    authorName: "Rachel Green",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
];

// 2. Categories & Specialized Tag / Topic Pools
interface CategoryDefinition {
  name: string;
  tags: string[];
  banners: string[];
  topics: {
    title: string;
    description: string;
    keyThemes: string[];
  }[];
}

const CATEGORIES: CategoryDefinition[] = [
  {
    name: "Technology",
    tags: [
      "Technology",
      "QuantumComputing",
      "CyberSecurity",
      "EdgeComputing",
      "IoT",
      "Blockchain",
      "5G",
      "ComputerHardware",
      "Cryptography",
      "FutureTech",
    ],
    banners: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    ],
    topics: [
      {
        title: "The Architecture of Post-Quantum Cryptography in Modern Networks",
        description:
          "Exploring lattice-based encryption algorithms and securing global public key infrastructures against impending quantum computer attacks.",
        keyThemes: ["quantum resistance", "lattice cryptography", "NIST standards", "zero trust"],
      },
      {
        title: "Zero-Trust Security Models for Autonomous Edge Computing",
        description:
          "Implementing identity-aware perimeters, hardware security modules (HSM), and decentralized verification at low-power edge nodes.",
        keyThemes: ["edge nodes", "mutual TLS", "cryptographic attestation", "threat modeling"],
      },
      {
        title: "Next-Generation Silicon Photonics and High-Bandwidth Interconnects",
        description:
          "How optical transceivers and light-driven co-packaged optics are displacing copper traces in planetary hyperscale datacenters.",
        keyThemes: ["silicon photonics", "optical interconnects", "thermal efficiency", "datacenters"],
      },
      {
        title: "Decentralized Identifiers (DIDs) and Verifiable Credentials",
        description:
          "Replacing centralized OAuth identity silos with cryptographic self-sovereign proofs and zero-knowledge identity mechanisms.",
        keyThemes: ["decentralized identity", "cryptographic proofs", "privacy protocols", "ZKPs"],
      },
      {
        title: "Ambient Computing and Autonomous IoT Sensor Networks",
        description:
          "Deploying energy-harvesting microcontrollers with ultra-low latency mesh networks for industrial sensor monitoring.",
        keyThemes: ["energy harvesting", "mesh protocols", "embedded firmware", "smart sensors"],
      },
    ],
  },
  {
    name: "System Design",
    tags: [
      "SystemDesign",
      "Microservices",
      "Scalability",
      "DistributedSystems",
      "EventDriven",
      "DatabaseDesign",
      "Caching",
      "Kafka",
      "HighAvailability",
      "Consensus",
    ],
    banners: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    ],
    topics: [
      {
        title: "Designing Global Consensus Engines with Raft and Paxos",
        description:
          "A deep exploration of leader election, log replication quorum guarantees, and network partition recovery in distributed storage systems.",
        keyThemes: ["Raft", "Paxos", "split-brain mitigation", "linearizable reads"],
      },
      {
        title: "Event-Driven Microservices with Kafka and Transactional Outbox Pattern",
        description:
          "Eliminating dual-write anomalies across relational stores and message brokers using change data capture and idempotent consumers.",
        keyThemes: ["transactional outbox", "CDC Debezium", "at-least-once delivery", "idempotency"],
      },
      {
        title: "Designing Multi-Region Distributed Key-Value Caching with Redis",
        description:
          "Mitigating cache stamps, thundering herds, and cache-aside stale replicas using consistent hashing and probabilistic early expiration.",
        keyThemes: ["consistent hashing", "cache invalidation", "active-active replication", "XADD streams"],
      },
      {
        title: "Database Sharding Strategies for Billions of Daily Time-Series Events",
        description:
          "Horizontal partitioning, compound range shard keys, and query routing strategies across distributed database clusters.",
        keyThemes: ["horizontal sharding", "vnodes", "partition pruning", "write amplification"],
      },
      {
        title: "Rate Limiting and Traffic Shaping at Terabit Scale",
        description:
          "Constructing distributed token buckets and sliding-window log limiters using Redis Lua scripts and eBPF kernel packet filters.",
        keyThemes: ["token bucket", "sliding window", "eBPF", "DoS protection"],
      },
    ],
  },
  {
    name: "Web Development",
    tags: [
      "WebDev",
      "React",
      "Nextjs",
      "TypeScript",
      "TailwindCSS",
      "Nodejs",
      "GraphQL",
      "WebSockets",
      "FrontendPerformance",
      "ServerComponents",
    ],
    banners: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    ],
    topics: [
      {
        title: "Mastering React Server Components (RSC) and Streaming Hydration",
        description:
          "Deconstructing partial prerendering, boundary suspense streaming, and eliminating client-side JavaScript bundle bloat.",
        keyThemes: ["server components", "suspense boundaries", "streaming SSR", "bundle optimization"],
      },
      {
        title: "Building Real-Time Collaborative Canvas Applications with WebSockets and CRDTs",
        description:
          "Resolving concurrent editing conflicts with conflict-free replicated data types (Yjs) and resilient bidirectional socket transports.",
        keyThemes: ["CRDT", "Yjs", "WebSockets", "state synchronization"],
      },
      {
        title: "Advanced TypeScript: Type-Level Programming and Template Literal Types",
        description:
          "Harnessing conditional types, mapped inference, distributive keys, and template literals for bulletproof enterprise schemas.",
        keyThemes: ["type-level programming", "conditional types", "branded types", "compile-time validation"],
      },
      {
        title: "Sub-Second Web Vitals: Optimizing INP, LCP, and Layout Shifts",
        description:
          "Profiling critical rendering paths, speculatively prefetching dynamic routes, and offloading heavy tasks to Web Workers.",
        keyThemes: ["Interaction to Next Paint", "Largest Contentful Paint", "Web Workers", "Resource Hints"],
      },
      {
        title: "Micro-Frontends Orchestration with Module Federation and Vite",
        description:
          "Decoupling monolithic single-page applications into isolated deployable units while sharing common dependencies at runtime.",
        keyThemes: ["Module Federation", "runtime dependency sharing", "independent deployments", "micro-apps"],
      },
    ],
  },
  {
    name: "AI & Machine Learning",
    tags: [
      "AI",
      "MachineLearning",
      "DeepLearning",
      "LLM",
      "VectorEmbeddings",
      "Transformers",
      "RAG",
      "ChromaDB",
      "PyTorch",
      "NLP",
    ],
    banners: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    ],
    topics: [
      {
        title: "Building Scalable Hybrid RAG Systems with Dense Embeddings and BM25",
        description:
          "Integrating dense semantic vector search with sparse keyword indexing, reciprocal rank fusion, and cross-encoder reranking.",
        keyThemes: ["retrieval augmented generation", "reciprocal rank fusion", "dense embeddings", "rerankers"],
      },
      {
        title: "Vector Database Internals: HNSW Graphs and Inverted File Indexing",
        description:
          "Understanding Hierarchical Navigable Small World graphs, quantization trade-offs, and cosine similarity metric performance.",
        keyThemes: ["HNSW index", "approximate nearest neighbors", "vector compression", "cosine distance"],
      },
      {
        title: "Fine-Tuning Open Source LLMs with LoRA and QLoRA on Consumer GPUs",
        description:
          "Parameter-efficient fine-tuning using Low-Rank Adaptation, 4-bit NormalFloat quantization, and FlashAttention-2 kernels.",
        keyThemes: ["LoRA", "quantization", "instruction tuning", "FlashAttention"],
      },
      {
        title: "Semantic Search and Recommendation Engines with Sentence Transformers",
        description:
          "Generating lightweight 384-dimensional dense vectors to power real-time personalized user feeds and topic clustering.",
        keyThemes: ["sentence transformers", "feature extraction", "cosine similarity", "semantic feed"],
      },
      {
        title: "AI Agent Orchestration: Function Calling and Multi-Step Planning Loops",
        description:
          "Designing deterministic state machines for autonomous LLM agents with structured tool invocation and feedback loops.",
        keyThemes: ["agent loops", "function calling", "ReAct framework", "state validation"],
      },
    ],
  },
  {
    name: "DevOps",
    tags: [
      "DevOps",
      "Docker",
      "Kubernetes",
      "CICD",
      "Terraform",
      "Observability",
      "Prometheus",
      "ArgoCD",
      "CloudNative",
      "PlatformEngineering",
    ],
    banners: [
      "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80",
    ],
    topics: [
      {
        title: "Zero-Downtime Multi-Cluster Kubernetes Deployments with GitOps and ArgoCD",
        description:
          "Declarative continuous delivery across heterogeneous clusters using automated drift detection and progressive canary rollouts.",
        keyThemes: ["GitOps", "ArgoCD", "progressive delivery", "canary releases"],
      },
      {
        title: "Full-Stack Observability with OpenTelemetry, Prometheus, and Grafana Tempo",
        description:
          "Correlating distributed trace IDs, metrics, and structured logs to pinpoint tail latency anomalies across microservices.",
        keyThemes: ["OpenTelemetry", "distributed tracing", "Prometheus metrics", "tail latency"],
      },
      {
        title: "Immutable Infrastructure with Terraform, Terragrunt, and Policy as Code",
        description:
          "Managing multi-environment cloud resources deterministically with OPA Rego governance rules and dry-run plan validations.",
        keyThemes: ["Infrastructure as Code", "Terraform", "OPA Rego", "drift prevention"],
      },
      {
        title: "Container Hardening and Distroless Images for Production Kubernetes",
        description:
          "Minimizing attack surfaces using non-root distroless base images, automated vulnerability scanning, and seccomp profiles.",
        keyThemes: ["distroless", "container security", "vulnerability scanning", "seccomp"],
      },
      {
        title: "Automated Chaos Engineering with Chaos Mesh and LitmusChaos",
        description:
          "Injecting network latency, pod kills, and DNS failures into staging environments to validate self-healing system resilience.",
        keyThemes: ["chaos engineering", "fault tolerance", "self-healing", "service mesh"],
      },
    ],
  },
];

// Helper: Pick random item from array
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Pick N random items from array
function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// Helper: Generate randomized markdown article content
function generateArticleContent(
  title: string,
  category: string,
  themes: string[],
  authorName: string
): string {
  return `## Overview
In the evolving domain of **${category}**, building resilient and performant systems requires a nuanced understanding of fundamental principles and practical architectures. This article analyzes **${title}**, examining real-world deployment challenges, benchmark numbers, and architectural trade-offs.

### Key Architectural Pillars
- **${themes[0] || "Architecture"}**: Ensuring strict consistency and fault-tolerant boundaries.
- **${themes[1] || "Throughput"}**: Minimizing latency overhead while handling spikes in production traffic.
- **${themes[2] || "Resilience"}**: Proactively isolating failure domains to prevent cascading downtime.

\`\`\`typescript
// Example snippet representing core logic
interface SystemMetric {
  latencyMs: number;
  throughputRps: number;
  status: "OPTIMAL" | "DEGRADED" | "CRITICAL";
}

export function evaluateHealth(metric: SystemMetric): boolean {
  if (metric.latencyMs > 250) {
    console.warn("[System Health] Degraded performance detected");
    return false;
  }
  return metric.status === "OPTIMAL";
}
\`\`\`

### Production Considerations & Lessons Learned
When deploying this approach at scale, observability and graceful degradation are paramount. As noted by lead engineers, monitoring distributed traces and maintaining automated failovers eliminates 99% of preventable incidents.

> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra

### Conclusion
By adopting these battle-tested patterns in **${category}**, engineering teams can deliver scalable, maintainable, and high-impact services. Written by **${authorName}**.`;
}

// Main Seeding Routine
async function seedLargeDataset() {
  console.log("==========================================================");
  console.log("🚀 Starting Large-Scale Blog Seeding Pipeline");
  console.log(`🎯 Goal: Generate 25 Authors & ${TOTAL_POSTS} Rich Blog Posts`);
  console.log(`📦 Batch Size: ${BATCH_SIZE} records per insertion`);
  console.log("==========================================================");

  try {
    // 1. Establish MongoDB Connection
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected successfully.");

    // Optional: Clear previous test blogs to ensure clean seed slate
    const existingCount = await Blog.countDocuments();
    console.log(`ℹ️ Current blog count in database: ${existingCount}`);

    // Prepare container for blog documents
    const blogRecords: Partial<IBlog>[] = [];
    const postsPerCategory = Math.ceil(TOTAL_POSTS / CATEGORIES.length);

    let postIndex = 0;

    // 2. Synthesize 200 rich blog posts
    for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
      const categoryDef = CATEGORIES[catIdx];

      for (let i = 0; i < postsPerCategory && postIndex < TOTAL_POSTS; i++) {
        postIndex++;
        const currentPostNum = postIndex;

        // Select an author and topic
        const author = pickRandom(AUTHORS);
        const topic =
          categoryDef.topics[i % categoryDef.topics.length];
        const bannerUrl = pickRandom(categoryDef.banners);

        // Derive randomized variation to ensure unique titles
        const variationSuffix =
          i >= categoryDef.topics.length
            ? ` (Part ${Math.floor(i / categoryDef.topics.length) + 1} - Case Study)`
            : "";
        const title = `${topic.title}${variationSuffix}`;
        const description = topic.description;

        // Tags: Category tag + 3-4 random tags from pool
        const tagSubPool = pickRandomN(categoryDef.tags, 4);
        const tags = Array.from(new Set([categoryDef.name, ...tagSubPool]));

        // Generate full markdown content
        const content = generateArticleContent(
          title,
          categoryDef.name,
          topic.keyThemes,
          author.authorName
        );

        // Metrics & Freshness: Stagger creation over the last 60 days
        const daysAgo = Math.floor(Math.random() * 60);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        const createdAt = new Date(
          Date.now() -
          daysAgo * 86400000 -
          hoursAgo * 3600000 -
          minutesAgo * 60000
        );

        const views = Math.floor(Math.random() * 12500) + 150;
        const likesCount = Math.floor(Math.random() * (views * 0.15)) + 12;
        // Generate dummy like user IDs
        const dummyLikes: string[] = [];
        for (let l = 0; l < Math.min(likesCount, 25); l++) {
          dummyLikes.push(new mongoose.Types.ObjectId().toString());
        }

        // Computed composite score: Engagement weighted + Freshness bonus
        const freshnessScore = Math.max(0, (60 - daysAgo) * 8);
        const engagementScore = Math.floor(views * 0.12 + likesCount * 2.5);
        const score = engagementScore + freshnessScore;

        // Embedding generation input text: rich composite string
        const embeddingText = `${title}. ${description} Category: ${categoryDef.name}. Topics: ${tags.join(", ")}.`;

        console.log(
          `[${currentPostNum}/${TOTAL_POSTS}] Generating embedding for: "${title.slice(0, 48)}..."`
        );

        const embedding = await generateEmbedding(embeddingText);

        const blogDoc: Partial<IBlog> = {
          _id: new mongoose.Types.ObjectId().toString(),
          title,
          description,
          content,
          banner: {
            public_id: "",
            url: bannerUrl,
          },
          tags,
          category: categoryDef.name,
          author: author.authorName,
          authorId: author.authorId,
          authorName: author.authorName,
          authorAvatar: author.authorAvatar,
          isPublished: true,
          views,
          likes: dummyLikes,
          likesCount,
          score,
          embedding,
          createdAt,
          updatedAt: createdAt,
        };

        blogRecords.push(blogDoc);
      }
    }

    console.log("\n==========================================================");
    console.log(`✅ Finished generating all ${blogRecords.length} embeddings.`);
    console.log("💾 Inserting records into MongoDB in batches of 50...");
    console.log("==========================================================");

    // 3. Batch Insertion into MongoDB & Optional ChromaDB Sync
    let insertedTotal = 0;

    for (let b = 0; b < blogRecords.length; b += BATCH_SIZE) {
      const batch = blogRecords.slice(b, b + BATCH_SIZE);
      const batchNum = Math.floor(b / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(blogRecords.length / BATCH_SIZE);

      console.log(
        `[Batch ${batchNum}/${totalBatches}] Inserting ${batch.length} documents into MongoDB...`
      );

      await Blog.insertMany(batch);
      insertedTotal += batch.length;

      // Optional ChromaDB vector indexing sync
      try {
        const collection = await getBlogCollection();
        await collection.upsert({
          ids: batch.map((doc) => doc._id as string),
          embeddings: batch.map((doc) => doc.embedding as number[]),
          metadatas: batch.map((doc) => ({
            title: doc.title || "",
            category: doc.category || "",
            authorId: doc.authorId || "",
            authorName: doc.authorName || "",
            isPublished: doc.isPublished ?? true,
          })),
          documents: batch.map(
            (doc) => `${doc.title} ${doc.description}`
          ),
        });
        console.log(
          `  └─ [ChromaDB] Indexed batch ${batchNum} (${batch.length} vectors) in ChromaDB collection.`
        );
      } catch (chromaError: any) {
        console.warn(
          `  └─ [ChromaDB Notice] Skipping ChromaDB batch index (${chromaError.message || "Offline"}).`
        );
      }
    }

    const finalCount = await Blog.countDocuments();
    console.log("\n==========================================================");
    console.log("🎉 Seeding Completed Successfully!");
    console.log(`📊 Total new records inserted: ${insertedTotal}`);
    console.log(`📊 Total blogs now in MongoDB: ${finalCount}`);
    console.log("==========================================================");

    // Graceful closure
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected gracefully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error occurred during seeding pipeline:", error);
    try {
      await mongoose.disconnect();
    } catch { }
    process.exit(1);
  }
}

// Execute seed script
seedLargeDataset();

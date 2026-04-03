/**
 * Standalone seed script for Neon PostgreSQL.
 * Usage: DATABASE_URL=<your-url> npx tsx scripts/seed.ts
 *
 * Idempotent — skips seeding if phases table already has data.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  phases, InsertPhase,
  bootcampDays, InsertBootcampDay,
  skills, InsertSkill,
  resources, InsertResource,
} from "../shared/schema";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seedDatabase() {
  console.log("Checking if database already seeded...");
  const existingPhases = await db.select().from(phases);
  if (existingPhases.length > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  console.log("Seeding phases...");
  // PHASES
  const phasesData: InsertPhase[] = [
    {
      phaseNumber: 0, name: "Bootcamp", description: "6-day intensive crash course covering Python, ML, DL, LLMs, Industrial AI, and portfolio setup",
      startDate: "2026-04-03", endDate: "2026-04-08",
      courses: JSON.stringify(["Python + Data Science Stack", "ML Fundamentals", "Deep Learning + Neural Networks", "LLMs + RAG", "Industrial AI", "Portfolio + Integration"]),
      projects: JSON.stringify(["Jupyter Notebook Portfolio", "GitHub Profile Setup", "Substack Launch", "First ML Model"]),
      milestones: JSON.stringify(["GitHub profile optimized", "First Substack article published", "6 notebooks completed", "Learning plan finalized"]),
    },
    {
      phaseNumber: 1, name: "ML Foundations", description: "Core machine learning: regression, classification, clustering, anomaly detection. Andrew Ng + fast.ai approach",
      startDate: "2026-04-09", endDate: "2026-06-17",
      courses: JSON.stringify(["Andrew Ng ML Specialization", "StatQuest YouTube Series", "fast.ai Practical DL for Coders", "Kaggle Learn ML"]),
      projects: JSON.stringify(["Regression Analysis Project", "Classification Pipeline", "Anomaly Detection System", "Kaggle Competition Entry"]),
      milestones: JSON.stringify(["ML Specialization Certificate", "3 Kaggle notebooks published", "First anomaly detection model", "Portfolio: 5+ projects"]),
    },
    {
      phaseNumber: 2, name: "Deep Learning + Transformers", description: "Neural networks from scratch, CNNs, RNNs, Transformer architecture, attention mechanisms",
      startDate: "2026-06-18", endDate: "2026-08-12",
      courses: JSON.stringify(["Karpathy Zero to Hero", "fast.ai (continued)", "HuggingFace LLM Course", "3Blue1Brown Neural Networks"]),
      projects: JSON.stringify(["MLP from Scratch", "Language Model", "CNN Image Classifier", "Transformer Implementation"]),
      milestones: JSON.stringify(["Built neural network from scratch", "Trained custom language model", "HuggingFace model published", "DL blog series (4 posts)"]),
    },
    {
      phaseNumber: 3, name: "LLM Engineering + RAG", description: "Embeddings, RAG pipelines, LangChain, agents, fine-tuning, production LLM applications",
      startDate: "2026-08-13", endDate: "2026-10-07",
      courses: JSON.stringify(["HuggingFace NLP Course", "DeepLearning.AI Short Courses", "LangChain Documentation", "Pinecone / Weaviate tutorials"]),
      projects: JSON.stringify(["Embedding Engine", "RAG Pipeline (production)", "AI Agent System", "Fine-tuned Domain Model"]),
      milestones: JSON.stringify(["Production RAG system deployed", "AI Agent demo published", "Fine-tuning blog post", "10+ Substack articles"]),
    },
    {
      phaseNumber: 4, name: "MLOps + Job Search", description: "Model deployment, CI/CD, monitoring, Azure/AWS certifications, interview preparation",
      startDate: "2026-10-08", endDate: "2026-12-31",
      courses: JSON.stringify(["MLOps Specialization", "FastAPI + Docker", "Azure AI-102", "AWS ML Specialty"]),
      projects: JSON.stringify(["Full ML Pipeline (CI/CD)", "Model Monitoring Dashboard", "Docker + K8s Deployment", "Interview Prep Repository"]),
      milestones: JSON.stringify(["Azure AI-102 certified", "End-to-end ML pipeline deployed", "50+ job applications", "3+ interview rounds"]),
    },
  ];
  for (const p of phasesData) {
    await db.insert(phases).values(p);
  }

  console.log("Seeding bootcamp days...");
  // BOOTCAMP DAYS
  const bootcampData: InsertBootcampDay[] = [
    {
      dayNumber: 1, date: "2026-04-03", theme: "Python + Data Science Stack",
      morningSchedule: JSON.stringify([
        { time: "08:00-09:00", task: "Python refresher — functions, classes, decorators", resource: "https://www.kaggle.com/learn/python" },
        { time: "09:00-10:30", task: "NumPy arrays, broadcasting, linear algebra basics", resource: "https://numpy.org/doc/stable/user/quickstart.html" },
        { time: "10:30-12:00", task: "Pandas DataFrames, groupby, merge, pivot tables", resource: "https://www.kaggle.com/learn/pandas" },
      ]),
      afternoonSchedule: JSON.stringify([
        { time: "13:00-14:30", task: "Matplotlib + Seaborn visualization", resource: "https://www.kaggle.com/learn/data-visualization" },
        { time: "14:30-16:00", task: "Build: EDA notebook on a real dataset (Titanic or House Prices)", resource: "https://www.kaggle.com/competitions/titanic" },
        { time: "16:00-17:00", task: "Push notebook to GitHub, write 3-sentence summary", resource: "" },
      ]),
      expectedOutputs: JSON.stringify(["Completed Kaggle Python course", "EDA notebook pushed to GitHub", "NumPy/Pandas cheat sheet created"]),
      status: "not_started",
    },
    {
      dayNumber: 2, date: "2026-04-04", theme: "ML Fundamentals with Scikit-learn",
      morningSchedule: JSON.stringify([
        { time: "08:00-09:30", task: "Supervised learning: Linear Regression, Logistic Regression", resource: "https://www.kaggle.com/learn/intro-to-machine-learning" },
        { time: "09:30-11:00", task: "Decision Trees, Random Forest, Cross-validation", resource: "https://www.youtube.com/c/joshstarmer" },
        { time: "11:00-12:00", task: "Model evaluation: accuracy, precision, recall, F1, ROC-AUC", resource: "" },
      ]),
      afternoonSchedule: JSON.stringify([
        { time: "13:00-14:30", task: "Unsupervised: K-Means, DBSCAN clustering", resource: "https://scikit-learn.org/stable/modules/clustering.html" },
        { time: "14:30-16:00", task: "Build: Classification pipeline (Iris or Wine dataset)", resource: "" },
        { time: "16:00-17:00", task: "Push to GitHub + document model performance", resource: "" },
      ]),
      expectedOutputs: JSON.stringify(["Classification pipeline notebook", "Model comparison table", "GitHub repo: ml-fundamentals"]),
      status: "not_started",
    },
    {
      dayNumber: 3, date: "2026-04-05", theme: "Deep Learning + Neural Networks",
      morningSchedule: JSON.stringify([
        { time: "08:00-09:30", task: "Neural network basics: perceptrons, backpropagation", resource: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" },
        { time: "09:30-11:00", task: "PyTorch basics: tensors, autograd, nn.Module", resource: "https://pytorch.org/tutorials/beginner/basics/intro.html" },
        { time: "11:00-12:00", task: "Karpathy micrograd: build a tiny neural net from scratch", resource: "https://www.youtube.com/watch?v=VMj-3S1tku0" },
      ]),
      afternoonSchedule: JSON.stringify([
        { time: "13:00-14:30", task: "Build simple MLP in PyTorch (MNIST)", resource: "" },
        { time: "14:30-16:00", task: "CNN intro: convolution, pooling, architectures", resource: "" },
        { time: "16:00-17:00", task: "Push PyTorch notebooks to GitHub", resource: "" },
      ]),
      expectedOutputs: JSON.stringify(["MLP from scratch (micrograd style)", "PyTorch MNIST classifier", "Understanding of backpropagation"]),
      status: "not_started",
    },
    {
      dayNumber: 4, date: "2026-04-06", theme: "LLMs + RAG Pipeline",
      morningSchedule: JSON.stringify([
        { time: "08:00-09:30", task: "Transformer architecture overview, attention mechanism", resource: "https://jalammar.github.io/illustrated-transformer/" },
        { time: "09:30-11:00", task: "LangChain basics: chains, prompts, memory", resource: "https://python.langchain.com/docs/get_started/introduction" },
        { time: "11:00-12:00", task: "Vector databases: FAISS, Chroma, embeddings", resource: "https://www.deeplearning.ai/short-courses/" },
      ]),
      afternoonSchedule: JSON.stringify([
        { time: "13:00-14:30", task: "Build: Simple RAG pipeline with LangChain + Chroma", resource: "" },
        { time: "14:30-16:00", task: "Test with own documents (PDF, markdown)", resource: "" },
        { time: "16:00-17:00", task: "Push RAG demo to GitHub", resource: "" },
      ]),
      expectedOutputs: JSON.stringify(["Working RAG pipeline", "Understanding of embeddings + vector search", "LangChain basic proficiency"]),
      status: "not_started",
    },
    {
      dayNumber: 5, date: "2026-04-07", theme: "Industrial AI + Predictive Maintenance",
      morningSchedule: JSON.stringify([
        { time: "08:00-09:30", task: "Time series fundamentals: trends, seasonality, stationarity", resource: "https://www.kaggle.com/learn/time-series" },
        { time: "09:30-11:00", task: "Predictive maintenance concepts: RUL, failure prediction", resource: "https://www.kaggle.com/datasets/behrad3d/nasa-cmaps" },
        { time: "11:00-12:00", task: "Anomaly detection with sensor data: Isolation Forest, Autoencoders", resource: "" },
      ]),
      afternoonSchedule: JSON.stringify([
        { time: "13:00-14:30", task: "Build: Predictive maintenance model (NASA CMAPSS)", resource: "" },
        { time: "14:30-16:00", task: "Visualization dashboard for sensor data", resource: "" },
        { time: "16:00-17:00", task: "Write blog post outline: 'Why Industrial AI Needs ML Engineers'", resource: "" },
      ]),
      expectedOutputs: JSON.stringify(["Predictive maintenance notebook", "Sensor anomaly detection demo", "Industrial AI blog outline"]),
      status: "not_started",
    },
    {
      dayNumber: 6, date: "2026-04-08", theme: "Integration + Portfolio Launch",
      morningSchedule: JSON.stringify([
        { time: "08:00-09:30", task: "GitHub profile optimization: README, pinned repos, descriptions", resource: "https://github.com" },
        { time: "09:30-11:00", task: "Substack setup + publish first article: 'My AI Engineering Journey'", resource: "https://substack.com" },
        { time: "11:00-12:00", task: "LinkedIn profile update: headline, about, featured", resource: "https://linkedin.com" },
      ]),
      afternoonSchedule: JSON.stringify([
        { time: "13:00-14:30", task: "X/Twitter profile setup, first thread about learning plan", resource: "https://x.com" },
        { time: "14:30-16:00", task: "Review all 5 notebooks, clean code, add documentation", resource: "" },
        { time: "16:00-17:00", task: "Plan Phase 1 week-by-week breakdown, set calendar reminders", resource: "" },
      ]),
      expectedOutputs: JSON.stringify(["Optimized GitHub profile with 5+ repos", "First Substack article published", "Updated LinkedIn profile", "Phase 1 weekly plan finalized"]),
      status: "not_started",
    },
  ];
  for (const d of bootcampData) {
    await db.insert(bootcampDays).values(d);
  }

  console.log("Seeding skills...");
  // SKILLS
  const skillsData: InsertSkill[] = [
    // Fundamentals
    { name: "Python Programming", category: "Fundamentals", currentLevel: 0, targetLevel: 5, status: "not_started" },
    { name: "NumPy / Pandas / Matplotlib", category: "Fundamentals", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "SQL", category: "Fundamentals", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Git / GitHub", category: "Fundamentals", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Jupyter Notebooks", category: "Fundamentals", currentLevel: 0, targetLevel: 4, status: "not_started" },
    // ML/AI
    { name: "Linear / Logistic Regression", category: "ML / AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Decision Trees / Random Forest", category: "ML / AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "SVM / KNN", category: "ML / AI", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Clustering (K-Means, DBSCAN)", category: "ML / AI", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Anomaly Detection (Isolation Forest)", category: "ML / AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Neural Networks (MLP)", category: "ML / AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "CNN (Convolutional)", category: "ML / AI", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "RNN / LSTM", category: "ML / AI", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Transformer Architecture", category: "ML / AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Attention Mechanism", category: "ML / AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    // LLM / GenAI
    { name: "Prompt Engineering", category: "LLM / GenAI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "LangChain / LlamaIndex", category: "LLM / GenAI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "RAG Pipeline", category: "LLM / GenAI", currentLevel: 0, targetLevel: 5, status: "not_started" },
    { name: "Vector Databases (FAISS, Chroma)", category: "LLM / GenAI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Embedding Models", category: "LLM / GenAI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Fine-tuning LLMs", category: "LLM / GenAI", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "AI Agents (LangGraph)", category: "LLM / GenAI", currentLevel: 0, targetLevel: 3, status: "not_started" },
    // MLOps
    { name: "Docker", category: "MLOps", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "FastAPI", category: "MLOps", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "CI/CD (GitHub Actions)", category: "MLOps", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "MLflow / W&B", category: "MLOps", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Cloud (Azure / AWS)", category: "MLOps", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Model Monitoring", category: "MLOps", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Kubernetes (Basic)", category: "MLOps", currentLevel: 0, targetLevel: 2, status: "not_started" },
    // Industrial AI
    { name: "Time Series Analysis", category: "Industrial AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Predictive Maintenance", category: "Industrial AI", currentLevel: 0, targetLevel: 5, status: "not_started" },
    { name: "Anomaly Detection (Sensors)", category: "Industrial AI", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Digital Twin (Concepts)", category: "Industrial AI", currentLevel: 0, targetLevel: 2, status: "not_started" },
    { name: "OPC-UA / SCADA (Basic)", category: "Industrial AI", currentLevel: 0, targetLevel: 2, status: "not_started" },
    // Soft Skills
    { name: "Technical Writing (Substack)", category: "Soft Skills", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "Public Speaking", category: "Soft Skills", currentLevel: 0, targetLevel: 3, status: "not_started" },
    { name: "Networking (LinkedIn, Events)", category: "Soft Skills", currentLevel: 0, targetLevel: 4, status: "not_started" },
    { name: "GitHub Portfolio", category: "Soft Skills", currentLevel: 0, targetLevel: 5, status: "not_started" },
    { name: "X/Twitter Presence", category: "Soft Skills", currentLevel: 0, targetLevel: 3, status: "not_started" },
  ];
  for (const s of skillsData) {
    await db.insert(skills).values(s);
  }

  console.log("Seeding resources...");
  // RESOURCES
  const resourcesData: InsertResource[] = [
    // Phase 0
    { name: "Kaggle Learn Python", url: "https://www.kaggle.com/learn/python", platform: "Kaggle", category: "Python", phaseNumber: 0, estimatedHours: 5, isFree: 1, status: "not_started" },
    { name: "Kaggle Learn Pandas", url: "https://www.kaggle.com/learn/pandas", platform: "Kaggle", category: "Python", phaseNumber: 0, estimatedHours: 4, isFree: 1, status: "not_started" },
    { name: "Kaggle Data Visualization", url: "https://www.kaggle.com/learn/data-visualization", platform: "Kaggle", category: "Python", phaseNumber: 0, estimatedHours: 4, isFree: 1, status: "not_started" },
    { name: "3Blue1Brown Neural Networks", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", platform: "YouTube", category: "Deep Learning", phaseNumber: 0, estimatedHours: 3, isFree: 1, status: "not_started" },
    { name: "Karpathy micrograd", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", platform: "YouTube", category: "Deep Learning", phaseNumber: 0, estimatedHours: 2.5, isFree: 1, status: "not_started" },
    { name: "Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", platform: "Blog", category: "LLM", phaseNumber: 0, estimatedHours: 2, isFree: 1, status: "not_started" },
    // Phase 1
    { name: "Andrew Ng ML Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction", platform: "Coursera", category: "ML", phaseNumber: 1, estimatedHours: 60, isFree: 0, status: "not_started" },
    { name: "StatQuest YouTube", url: "https://www.youtube.com/c/joshstarmer", platform: "YouTube", category: "ML", phaseNumber: 1, estimatedHours: 20, isFree: 1, status: "not_started" },
    { name: "fast.ai Practical DL", url: "https://course.fast.ai/", platform: "fast.ai", category: "Deep Learning", phaseNumber: 1, estimatedHours: 40, isFree: 1, status: "not_started" },
    { name: "Kaggle Intro to ML", url: "https://www.kaggle.com/learn/intro-to-machine-learning", platform: "Kaggle", category: "ML", phaseNumber: 1, estimatedHours: 3, isFree: 1, status: "not_started" },
    { name: "Kaggle Intermediate ML", url: "https://www.kaggle.com/learn/intermediate-machine-learning", platform: "Kaggle", category: "ML", phaseNumber: 1, estimatedHours: 4, isFree: 1, status: "not_started" },
    // Phase 2
    { name: "Karpathy Zero to Hero", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", platform: "YouTube", category: "Deep Learning", phaseNumber: 2, estimatedHours: 20, isFree: 1, status: "not_started" },
    { name: "HuggingFace LLM Course", url: "https://huggingface.co/learn/llm-course", platform: "HuggingFace", category: "LLM", phaseNumber: 2, estimatedHours: 15, isFree: 1, status: "not_started" },
    { name: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials/", platform: "PyTorch", category: "Deep Learning", phaseNumber: 2, estimatedHours: 10, isFree: 1, status: "not_started" },
    // Phase 3
    { name: "HuggingFace NLP Course", url: "https://huggingface.co/learn/nlp-course", platform: "HuggingFace", category: "NLP", phaseNumber: 3, estimatedHours: 15, isFree: 1, status: "not_started" },
    { name: "DeepLearning.AI Short Courses", url: "https://www.deeplearning.ai/short-courses/", platform: "DeepLearning.AI", category: "LLM", phaseNumber: 3, estimatedHours: 20, isFree: 1, status: "not_started" },
    { name: "LangChain Documentation", url: "https://python.langchain.com/docs/get_started/introduction", platform: "LangChain", category: "LLM", phaseNumber: 3, estimatedHours: 10, isFree: 1, status: "not_started" },
    { name: "Pinecone Learning Center", url: "https://www.pinecone.io/learn/", platform: "Pinecone", category: "Vector DB", phaseNumber: 3, estimatedHours: 5, isFree: 1, status: "not_started" },
    // Phase 4
    { name: "MLOps Specialization", url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops", platform: "Coursera", category: "MLOps", phaseNumber: 4, estimatedHours: 40, isFree: 0, status: "not_started" },
    { name: "Azure AI-102 Prep", url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/", platform: "Microsoft", category: "Certification", phaseNumber: 4, estimatedHours: 30, isFree: 0, status: "not_started" },
    { name: "AWS ML Specialty", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/", platform: "AWS", category: "Certification", phaseNumber: 4, estimatedHours: 30, isFree: 0, status: "not_started" },
    { name: "FastAPI Documentation", url: "https://fastapi.tiangolo.com/tutorial/", platform: "FastAPI", category: "MLOps", phaseNumber: 4, estimatedHours: 8, isFree: 1, status: "not_started" },
    { name: "Docker for Data Science", url: "https://docs.docker.com/get-started/", platform: "Docker", category: "MLOps", phaseNumber: 4, estimatedHours: 6, isFree: 1, status: "not_started" },
    { name: "Kaggle Time Series", url: "https://www.kaggle.com/learn/time-series", platform: "Kaggle", category: "Industrial AI", phaseNumber: 1, estimatedHours: 5, isFree: 1, status: "not_started" },
    { name: "NASA CMAPSS Dataset", url: "https://www.kaggle.com/datasets/behrad3d/nasa-cmaps", platform: "Kaggle", category: "Industrial AI", phaseNumber: 1, estimatedHours: 8, isFree: 1, status: "not_started" },
  ];
  for (const r of resourcesData) {
    await db.insert(resources).values(r);
  }

  console.log("Database seeded successfully!");
}

seedDatabase().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

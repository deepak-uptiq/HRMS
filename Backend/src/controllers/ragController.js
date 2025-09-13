const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simple RAG implementation with HRMS knowledge base
const hrmsKnowledgeBase = [
  {
    question: "How do I request leave?",
    answer: "You can request leave by going to the Leave Requests section in your dashboard. Click 'Request Leave', fill in the details including leave type, start date, end date, and reason, then submit your request.",
    category: "leave"
  },
  {
    question: "What types of leave are available?",
    answer: "Available leave types include: Sick Leave, Vacation Leave, Personal Leave, Maternity Leave, Paternity Leave, and Emergency Leave.",
    category: "leave"
  },
  {
    question: "How can I view my payslips?",
    answer: "You can view and download your payslips from the Payslips section in your employee dashboard. All your monthly payslips will be listed there.",
    category: "payroll"
  },
  {
    question: "How do I update my profile?",
    answer: "Go to Profile Management in your dashboard to update your personal information, contact details, and other profile data.",
    category: "profile"
  },
  {
    question: "How can I check my performance reviews?",
    answer: "Your performance reviews are available in the Performance section of your dashboard. You can view past reviews and ratings from your managers.",
    category: "performance"
  },
  {
    question: "What is the HRMS system?",
    answer: "HRMS (Human Resource Management System) is a comprehensive platform for managing employee data, leave requests, payroll, performance reviews, and other HR-related activities.",
    category: "general"
  },
  {
    question: "How do I contact HR?",
    answer: "You can contact HR through the announcements section or by reaching out to your direct manager. HR contact information is also available in company announcements.",
    category: "contact"
  },
  {
    question: "What should I do if I forget my password?",
    answer: "If you forget your password, contact your system administrator or HR department to reset your account credentials.",
    category: "technical"
  },
  {
    question: "How do I check my attendance?",
    answer: "Your attendance records are available in the Attendance section of your dashboard. You can view your daily attendance, working hours, and any attendance issues.",
    category: "attendance"
  },
  {
    question: "What is the company policy on remote work?",
    answer: "Remote work policies vary by department and position. Please check with your direct manager or HR for specific remote work guidelines and approval processes.",
    category: "policy"
  }
];

// Simple text similarity function
function calculateSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// RAG Q&A endpoint
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Question is required'
      });
    }

    // Find the most similar question in knowledge base
    let bestMatch = null;
    let bestScore = 0;
    
    for (const item of hrmsKnowledgeBase) {
      const similarity = calculateSimilarity(question, item.question);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = item;
      }
    }

    // If similarity is too low, provide a generic response
    if (bestScore < 0.1) {
      return res.status(200).json({
        status: 'success',
        data: {
          question: question,
          answer: "I'm sorry, I couldn't find a specific answer to your question. Please try rephrasing your question or contact HR for assistance. You can ask about leave requests, payslips, performance reviews, profile management, or general HRMS features.",
          confidence: bestScore,
          category: "general",
          suggestions: [
            "How do I request leave?",
            "How can I view my payslips?",
            "How do I update my profile?",
            "How can I check my performance reviews?"
          ]
        }
      });
    }

    // Return the best match
    res.status(200).json({
      status: 'success',
      data: {
        question: question,
        answer: bestMatch.answer,
        confidence: bestScore,
        category: bestMatch.category,
        suggestions: hrmsKnowledgeBase
          .filter(item => item.category === bestMatch.category && item.question !== bestMatch.question)
          .slice(0, 3)
          .map(item => item.question)
      }
    });

  } catch (error) {
    console.error('RAG Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get all available questions
const getAvailableQuestions = async (req, res) => {
  try {
    const categories = [...new Set(hrmsKnowledgeBase.map(item => item.category))];
    
    res.status(200).json({
      status: 'success',
      data: {
        categories: categories,
        questions: hrmsKnowledgeBase.map(item => ({
          question: item.question,
          category: item.category
        }))
      }
    });
  } catch (error) {
    console.error('RAG Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  askQuestion,
  getAvailableQuestions
};

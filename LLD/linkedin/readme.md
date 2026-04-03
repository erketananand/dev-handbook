# LinkedIn System - LLD

A complete low-level design of a LinkedIn-like social professional network platform built with TypeScript.

## 🎯 Overview

LinkedIn System is a comprehensive implementation of a professional networking platform featuring:
- **User Management**: Registration, profiles, and account management
- **Connections**: Friend requests, acceptance, rejection, and blocking
- **Posts**: Create, share, like, and comment on professional content
- **Direct Messaging**: Private messaging between users
- **Job Board**: Post jobs and apply for positions
- **Company Profiles**: Company registration and management
- **Search & Discovery**: Find people, companies, and job opportunities

## 📂 Project Structure

```
src/
├── enums/                    # Enumeration types
│   ├── AccountType.ts       # STANDARD, RECRUITER, ADMIN
│   ├── ConnectionStatus.ts  # PENDING, ACCEPTED, REJECTED, BLOCKED
│   ├── ConnectionLevel.ts   # FIRST_DEGREE, SECOND_DEGREE, THIRD_DEGREE_PLUS
│   ├── PostType.ts          # ARTICLE, JOB_OPENING, ACHIEVEMENT, etc.
│   ├── PostVisibility.ts    # PUBLIC, CONNECTIONS_ONLY, PRIVATE
│   ├── ProficiencyLevel.ts  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
│   ├── LikeType.ts          # POST, COMMENT
│   ├── JobType.ts           # FULL_TIME, PART_TIME, CONTRACT, INTERN
│   ├── ApplicationStatus.ts # APPLIED, REVIEWING, SHORTLISTED, REJECTED, ACCEPTED
│   ├── NotificationType.ts  # CONNECTION_REQUEST, MESSAGE, JOB_ALERT, etc.
│   ├── SearchFilterType.ts  # PEOPLE, COMPANIES, JOBS
│   └── index.ts             # Barrel export
│
├── models/                   # Domain entities
│   ├── User.ts              # User profile with verification status
│   ├── Connection.ts        # User-to-user connections with status
│   ├── Post.ts              # Social posts with likes/comments
│   ├── PostComment.ts       # Comments on posts
│   ├── Message.ts           # Direct messages with read status
│   ├── JobPosting.ts        # Job openings posted by recruiters
│   ├── JobApplication.ts    # Applications to jobs
│   ├── Company.ts           # Company profiles with verification
│   └── index.ts             # Barrel export
│
├── repositories/            # Data access layer
│   ├── UserRepository.ts
│   ├── ConnectionRepository.ts
│   ├── PostRepository.ts
│   ├── PostCommentRepository.ts
│   ├── MessageRepository.ts
│   ├── JobPostingRepository.ts
│   ├── JobApplicationRepository.ts
│   ├── CompanyRepository.ts
│   └── index.ts             # Barrel export
│
├── services/                # Business logic layer
│   ├── UserService.ts       # User management logic
│   ├── ConnectionService.ts # Connection handling
│   ├── PostService.ts       # Post and comment operations
│   ├── MessageService.ts    # Messaging logic
│   ├── JobService.ts        # Job and application handling
│   ├── CompanyService.ts    # Company management
│   └── index.ts             # Barrel export
│
├── utils/                   # Utility functions and helpers
│   ├── Errors.ts            # Custom error classes
│   ├── Validators.ts        # Validation functions
│   ├── IRepository.ts       # Generic repository interface
│   └── index.ts             # Barrel export
│
├── patterns/                # Design patterns explicit implementations
│   ├── strategies/          # Strategy pattern implementations
│   │   ├── PostStrategy.ts          # Interface for post type strategies
│   │   ├── ArticlePostStrategy.ts   # Strategy for article posts
│   │   ├── AchievementPostStrategy.ts # Strategy for achievement posts
│   │   ├── JobStrategy.ts           # Interface for job type strategies
│   │   ├── FullTimeJobStrategy.ts   # Strategy for full-time jobs
│   │   ├── ContractJobStrategy.ts   # Strategy for contract jobs
│   │   └── index.ts                 # Barrel export
│   ├── factories/           # Factory pattern implementations
│   │   ├── UserFactory.ts           # Factory for creating users
│   │   ├── PostFactory.ts           # Factory for creating posts
│   │   ├── ConnectionFactory.ts     # Factory for creating connections
│   │   └── index.ts                 # Barrel export
│   └── index.ts             # Patterns barrel export
│
├── console/                 # Demo and interactive interface
│   ├── ConsoleInterface.ts  # Interface contract
│   ├── ConsoleDemo.ts       # Implementation with interactive + automated modes
│   └── index.ts             # Barrel export
│
├── LinkedInService.ts       # Main facade service
├── examples.ts              # Entry point for demo
└── index.ts                 # Public API
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- TypeScript 5.0+

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the demo
npm start
```

## 📖 Usage

### Start Interactive Demo
```bash
npm start
```

This launches an interactive menu-driven interface where you can:
1. Manage user accounts (register, update profile)
2. Handle connections (send requests, accept/reject)
3. Create and interact with posts
4. Send direct messages
5. Post and apply for jobs
6. Manage companies

### Run Full Automated Demo
From the main menu, select option 7 to run a comprehensive demonstration that showcases all system features.

## 🏗️ Architecture

### Layered Design

1. **Enums Layer**: Defines all enumeration types for type safety
2. **Models Layer**: Domain entities with business logic methods
3. **Repository Layer**: Data access abstraction (currently in-memory, easily swappable with database)
4. **Service Layer**: Business logic orchestration and validation
5. **Console Layer**: User interface and demo implementation

### Key Design Patterns

- **Repository Pattern**: Abstracts data access with `IRepository<T>` interface
- **Service Locator**: Services manage their own repositories
- **Facade Pattern**: `LinkedInService` provides simplified public API
- **Strategy Pattern**: Explicit implementations in `patterns/strategies/` for post and job behaviors
  - `PostStrategy` interface with `ArticlePostStrategy`, `AchievementPostStrategy` implementations
  - `JobStrategy` interface with `FullTimeJobStrategy`, `ContractJobStrategy` implementations
- **Factory Pattern**: Explicit implementations in `patterns/factories/` for entity creation
  - `UserFactory` for creating different user types
  - `PostFactory` for creating posts with strategy validation
  - `ConnectionFactory` for creating and managing connections

## 📊 Database Schema

### Core Tables

**User**
- userId (PK)
- firstName, lastName
- email (UNIQUE), password
- headline, bio
- accountType
- isVerified, isActive
- createdAt, updatedAt

**Connection**
- connectionId (PK)
- userId, connectedUserId (FK)
- status (PENDING, ACCEPTED, REJECTED, BLOCKED)
- createdAt, connectedAt

**Post**
- postId (PK)
- userId (FK)
- content, postType
- mediaUrls[]
- likeCount, commentCount
- isActive, createdAt

**Message**
- messageId (PK)
- senderId, receiverId (FK)
- content, mediaUrls[]
- isRead, createdAt

**JobPosting**
- jobPostingId (PK)
- recruiterId, companyId (FK)
- title, description, jobType
- location, minSalary, maxSalary
- isActive, applicationCount
- createdAt, closedAt

**Company**
- companyId (PK)
- companyName, industry
- location, website
- logo, isVerified
- createdAt, verifiedAt

See [schema.md](./schema.md) for complete database design.

## 🎨 Class Diagram

See [class-diagram.md](./class-diagram.md) for complete UML class diagram.

## ✅ Features

### User Management
- ✅ User registration with validation
- ✅ Profile management (update basic info)
- ✅ Account verification
- ✅ Search users
- ✅ Deactivate account

### Social Connections
- ✅ Send connection requests
- ✅ Accept/reject requests
- ✅ Block users
- ✅ View connections
- ✅ Pending request management

### Posts & Content
- ✅ Create posts (various types: article, achievement, update, etc.)
- ✅ Like/unlike posts
- ✅ Add comments to posts
- ✅ Delete posts
- ✅ View post feed
- ✅ Filter by post type

### Messaging
- ✅ Send direct messages
- ✅ View conversation history
- ✅ Mark messages as read
- ✅ Unread messages count
- ✅ Support for media attachments

### Job Board
- ✅ Post job openings
- ✅ Apply for jobs
- ✅ Review applications
- ✅ Update application status
- ✅ Search jobs by location/type
- ✅ Job posting lifecycle management

### Companies
- ✅ Company registration
- ✅ Update company info
- ✅ Company verification
- ✅ Search companies
- ✅ Filter by industry/location

## 🔧 Tech Stack

- **Language**: TypeScript 5.0+
- **Runtime**: Node.js
- **Build**: tsc (TypeScript Compiler)
- **Type Safety**: Strict mode enabled
- **Testing**: Ready for Jest/Mocha integration

## 📝 API Examples

### User Management
```typescript
const linkedin = new LinkedInService();
const userService = linkedin.getUsers();

// Register user
const user = await userService.registerUser(
  "John", "Doe", "john@example.com", "Password123", "Software Engineer"
);

// Search users
const results = await userService.searchUsers("John");
```

### Connections
```typescript
const connectionService = linkedin.getConnections();

// Send connection request
const connection = await connectionService.sendConnectionRequest(user1Id, user2Id);

// Accept request
await connectionService.acceptConnectionRequest(user2Id, connectionId);
```

### Posts
```typescript
const postService = linkedin.getPosts();

// Create post
const post = await postService.createPost(userId, "Great news!", PostType.UPDATE);

// Like and comment
await postService.likePost(postId, userId);
await postService.addComment(postId, userId, "Nice post!");
```

### Jobs
```typescript
const jobService = linkedin.getJobs();

// Post job
const job = await jobService.postJob(
  recruiterId, companyId, "Senior Engineer", "...", JobType.FULL_TIME, "NYC", 100000, 150000
);

// Apply for job
const application = await jobService.applyForJob(jobId, userId, "resume.pdf", "...");
```

### Using Factories
```typescript
import { UserFactory, PostFactory, ConnectionFactory } from "./patterns";
import { ArticlePostStrategy } from "./patterns/strategies";

// Create different user types using factory
const standardUser = UserFactory.createStandardUser("john@example.com", "John", "Doe");
const recruiter = UserFactory.createRecruiterUser("recruiter@example.com", "Jane", "Smith", "TechCorp");
const admin = UserFactory.createAdminUser("admin@example.com", "Admin", "User");

// Create connection using factory
const connection = ConnectionFactory.createConnectionRequest(user1Id, user2Id);

// Create posts using factory
const articlePost = PostFactory.createArticlePost(userId, "Detailed technical article about...");
const achievementPost = PostFactory.createAchievementPost(userId, "Promoted to Senior Engineer!");
```

### Using Strategies
```typescript
import { ArticlePostStrategy, FullTimeJobStrategy } from "./patterns/strategies";

// Use post strategy for validation
const articleStrategy = new ArticlePostStrategy();
if (articleStrategy.validatePost(content)) {
  const post = PostFactory.createPost(userId, content, PostType.ARTICLE, articleStrategy);
  console.log(post.displayFormat); // "📰 [ARTICLE] ..."
}

// Use job strategy for job posting
const jobStrategy = new FullTimeJobStrategy();
const postingDays = jobStrategy.getPostingDuration(); // 60 days for full-time
const requiresBenefits = jobStrategy.requiresBenefits(); // true for full-time
```

## 🧪 Testing

The system is fully typed and ready for integration testing. Example:

```typescript
const linkedin = new LinkedInService();
const userService = linkedin.getUsers();
const postService = linkedin.getPosts();

// Test workflow
const user = await userService.registerUser(...);
const post = await postService.createPost(user.userId, "Test", PostType.UPDATE);
const comments = await postService.getPostComments(post.postId);
```

## 🎓 Learning Path

1. **Start with Enums**: Understand type safety and constants
2. **Study Models**: Learn about domain entities and business logic
3. **Explore Repositories**: Understand data access patterns
4. **Review Services**: See how business logic is orchestrated
5. **Run Demo**: Experience the system in action
6. **Modify & Extend**: Build your own features

## 🔄 Future Enhancements

- [ ] Database integration (PostgreSQL, MongoDB)
- [ ] REST API layer
- [ ] GraphQL API
- [ ] Authentication & authorization
- [ ] Recommendation engine
- [ ] Notification system
- [ ] Feed algorithm
- [ ] Full-text search
- [ ] Analytics dashboard
- [ ] Real-time messaging (WebSocket)

## 📚 References

This implementation follows the guidelines from:
- [LLD Guidelines](../LLD-WORKFLOW-GUIDELINES.md)
- [LLD Quick Start Guide](../LLD-QUICK-START-GUIDE.md)
- [How to Approach LLD](../how-to-approach-lld-problem.md)

## 📄 License

This is an educational project for learning low-level system design.

## 🤝 Contributing

This is a reference implementation. Feel free to fork and extend it for learning purposes.

---

**Last Updated**: 2024
**Status**: ✅ Complete working implementation

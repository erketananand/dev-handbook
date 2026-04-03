# LinkedIn System - Database Schema Design

This document describes the database schema for the modular LinkedIn system implementation. The schema design is independent of the code organization and serves as the foundation for the data persistence layer across all repositories (`src/repositories/`).

## Database Tables

### 1. **User**
Stores user account and profile information.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| userId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| firstName | VARCHAR(100) | NOT NULL | User's first name |
| lastName | VARCHAR(100) | NOT NULL | User's last name |
| headline | VARCHAR(200) | DEFAULT NULL | Professional headline |
| summary | TEXT | DEFAULT NULL | Professional summary |
| profilePicture | VARCHAR(500) | DEFAULT NULL | URL to profile picture |
| location | VARCHAR(200) | DEFAULT NULL | User's location |
| industry | VARCHAR(100) | DEFAULT NULL | Industry field |
| accountType | ENUM(STANDARD, RECRUITER, ADMIN) | DEFAULT STANDARD | Account type |
| isVerified | BOOLEAN | DEFAULT false | Email verification status |
| isActive | BOOLEAN | DEFAULT true | Account active status |
| createdAt | TIMESTAMP | NOT NULL | Account creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last profile update |

**Indexes**: email (unique), user_id, account_type, is_active

---

### 2. **Experience**
User's work experience history.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| experienceId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Reference to user |
| jobTitle | VARCHAR(255) | NOT NULL | Job title |
| company | VARCHAR(255) | NOT NULL | Company name |
| location | VARCHAR(200) | DEFAULT NULL | Work location |
| startDate | DATE | NOT NULL | Employment start date |
| endDate | DATE | DEFAULT NULL | Employment end date (NULL if current) |
| description | TEXT | DEFAULT NULL | Job description |
| isCurrent | BOOLEAN | DEFAULT false | Is current job |
| createdAt | TIMESTAMP | NOT NULL | When added |

**Indexes**: user_id, is_current, start_date

---

### 3. **Education**
User's educational background.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| educationId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Reference to user |
| school | VARCHAR(255) | NOT NULL | School/University name |
| degree | VARCHAR(100) | NOT NULL | Degree type |
| fieldOfStudy | VARCHAR(100) | NOT NULL | Field of study |
| startYear | INT | NOT NULL | Start year |
| endYear | INT | DEFAULT NULL | End year (NULL if ongoing) |
| grade | VARCHAR(10) | DEFAULT NULL | Grade/GPA |
| description | TEXT | DEFAULT NULL | Additional description |
| createdAt | TIMESTAMP | NOT NULL | When added |

**Indexes**: user_id, start_year

---

### 4. **Skill**
User's professional skills.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| skillId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Reference to user |
| skillName | VARCHAR(100) | NOT NULL | Skill name |
| proficiency | ENUM(BEGINNER, INTERMEDIATE, ADVANCED, EXPERT) | DEFAULT INTERMEDIATE | Proficiency level |
| endorsementCount | INT | DEFAULT 0 | Number of endorsements |
| createdAt | TIMESTAMP | NOT NULL | When added |

**Indexes**: user_id, skill_name, endorsement_count

---

### 5. **Certification**
User's certifications and credentials.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| certificationId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Reference to user |
| certificationName | VARCHAR(255) | NOT NULL | Certificate name |
| issuingOrganization | VARCHAR(255) | NOT NULL | Issuing organization |
| issueDate | DATE | NOT NULL | Issue date |
| expiryDate | DATE | DEFAULT NULL | Expiry date (NULL if no expiry) |
| credentialUrl | VARCHAR(500) | DEFAULT NULL | URL to credential |
| createdAt | TIMESTAMP | NOT NULL | When added |

**Indexes**: user_id, issue_date

---

### 6. **Connection**
User connections and relationship tracking.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| connectionId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | User initiating connection |
| connectedUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | User being connected |
| status | ENUM(PENDING, ACCEPTED, REJECTED, BLOCKED) | DEFAULT PENDING | Connection status |
| connectionLevel | ENUM(FIRST_DEGREE, SECOND_DEGREE, THIRD_DEGREE_PLUS) | DEFAULT THIRD_DEGREE_PLUS | Connection level |
| connectedAt | TIMESTAMP | NULL | When connection accepted |
| createdAt | TIMESTAMP | NOT NULL | When connection requested |

**Indexes**: user_id, connected_user_id, status, connection_level
**Constraints**: UNIQUE (user_id, connected_user_id)

---

### 7. **Post**
User posts and content.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| postId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Post author |
| content | TEXT | NOT NULL | Post content |
| postType | ENUM(ARTICLE, JOB_OPENING, ACHIEVEMENT, RESEARCH, FINDING, UPDATE) | DEFAULT ARTICLE | Type of post |
| mediaUrl | VARCHAR(500) | DEFAULT NULL | Attached media URL |
| likeCount | INT | DEFAULT 0 | Number of likes |
| commentCount | INT | DEFAULT 0 | Number of comments |
| shareCount | INT | DEFAULT 0 | Number of shares |
| visibility | ENUM(PUBLIC, CONNECTIONS_ONLY, PRIVATE) | DEFAULT PUBLIC | Post visibility |
| isActive | BOOLEAN | DEFAULT true | Is post active |
| createdAt | TIMESTAMP | NOT NULL | Post creation time |
| updatedAt | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: user_id, post_type, visibility, created_at

---

### 8. **PostComment**
Comments on posts.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| commentId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| postId | UUID | FOREIGN KEY (Post.postId), NOT NULL | Reference to post |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Comment author |
| content | TEXT | NOT NULL | Comment content |
| likeCount | INT | DEFAULT 0 | Number of likes |
| createdAt | TIMESTAMP | NOT NULL | Comment creation time |
| updatedAt | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: post_id, user_id, created_at

---

### 9. **PostLike**
Likes on posts and comments.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| likeId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | User who liked |
| postId | UUID | FOREIGN KEY (Post.postId), NOT NULL | Post liked |
| commentId | UUID | FOREIGN KEY (PostComment.commentId), NULL | Comment liked (if applicable) |
| likeType | ENUM(POST, COMMENT) | NOT NULL | Type of like |
| createdAt | TIMESTAMP | NOT NULL | When liked |

**Indexes**: user_id, post_id, comment_id

---

### 10. **Message**
Direct messages between users.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| messageId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| senderId | UUID | FOREIGN KEY (User.userId), NOT NULL | Message sender |
| receiverId | UUID | FOREIGN KEY (User.userId), NOT NULL | Message receiver |
| content | TEXT | NOT NULL | Message content |
| mediaUrl | VARCHAR(500) | DEFAULT NULL | Attached media URL |
| isRead | BOOLEAN | DEFAULT false | Read status |
| readAt | TIMESTAMP | DEFAULT NULL | When message was read |
| createdAt | TIMESTAMP | NOT NULL | Message sent time |

**Indexes**: sender_id, receiver_id, is_read, created_at

---

### 11. **JobPosting**
Job openings posted by recruiters.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| jobPostingId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| recruiterId | UUID | FOREIGN KEY (User.userId), NOT NULL | Recruiter who posted |
| companyId | UUID | FOREIGN KEY (Company.companyId), NOT NULL | Company |
| jobTitle | VARCHAR(255) | NOT NULL | Job title |
| description | TEXT | NOT NULL | Job description |
| requirements | TEXT | NOT NULL | Required skills/experience |
| location | VARCHAR(200) | NOT NULL | Job location |
| jobType | ENUM(FULL_TIME, PART_TIME, CONTRACT, INTERN) | NOT NULL | Type of job |
| salaryMin | DECIMAL(12,2) | DEFAULT NULL | Minimum salary |
| salaryMax | DECIMAL(12,2) | DEFAULT NULL | Maximum salary |
| currency | VARCHAR(3) | DEFAULT 'USD' | Salary currency |
| applicationCount | INT | DEFAULT 0 | Number of applications |
| isActive | BOOLEAN | DEFAULT true | Is job posting active |
| createdAt | TIMESTAMP | NOT NULL | Posted date |
| closedAt | TIMESTAMP | DEFAULT NULL | When job closed |

**Indexes**: recruiter_id, company_id, job_type, is_active, created_at

---

### 12. **JobApplication**
Applications to job postings.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| applicationId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| jobPostingId | UUID | FOREIGN KEY (JobPosting.jobPostingId), NOT NULL | Job applied to |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Applicant |
| resumeUrl | VARCHAR(500) | NOT NULL | Resume URL |
| coverLetter | TEXT | DEFAULT NULL | Cover letter |
| status | ENUM(APPLIED, REVIEWING, SHORTLISTED, REJECTED, ACCEPTED) | DEFAULT APPLIED | Application status |
| ratings | INT | DEFAULT 0 | Recruiter rating (0-5) |
| feedback | TEXT | DEFAULT NULL | Recruiter feedback |
| appliedAt | TIMESTAMP | NOT NULL | Application date |
| updatedAt | TIMESTAMP | NOT NULL | Last status update |

**Indexes**: job_posting_id, user_id, status, applied_at

---

### 13. **Company**
Company profiles.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| companyId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| companyName | VARCHAR(255) | UNIQUE, NOT NULL | Company name |
| industry | VARCHAR(100) | NOT NULL | Industry type |
| website | VARCHAR(500) | DEFAULT NULL | Company website |
| location | VARCHAR(200) | NOT NULL | Company headquarters |
| description | TEXT | DEFAULT NULL | Company description |
| logo | VARCHAR(500) | DEFAULT NULL | Company logo URL |
| totalEmployees | INT | DEFAULT NULL | Number of employees |
| isVerified | BOOLEAN | DEFAULT false | Is company verified |
| createdAt | TIMESTAMP | NOT NULL | When added |
| updatedAt | TIMESTAMP | NOT NULL | Last update |

**Indexes**: company_name, industry, is_verified

---

### 14. **Notification**
User notifications.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| notificationId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Recipient user |
| notificationType | ENUM(CONNECTION_REQUEST, MESSAGE, JOB_ALERT, COMMENT, LIKE, MENTION) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| sourceUserId | UUID | FOREIGN KEY (User.userId), DEFAULT NULL | User who triggered notification |
| relatedObjectId | UUID | DEFAULT NULL | ID of related object (post, job, etc.) |
| isRead | BOOLEAN | DEFAULT false | Read status |
| createdAt | TIMESTAMP | NOT NULL | When notified |

**Indexes**: user_id, notification_type, is_read, created_at

---

### 15. **SearchFilter**
Saved search filters for quick access.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| filterId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | User who created filter |
| filterType | ENUM(PEOPLE, COMPANIES, JOBS) | NOT NULL | What to search for |
| filterName | VARCHAR(255) | NOT NULL | Saved filter name |
| filterCriteria | JSON | NOT NULL | Filter criteria (JSON) |
| isSaved | BOOLEAN | DEFAULT true | Is filter saved |
| createdAt | TIMESTAMP | NOT NULL | When created |

**Indexes**: user_id, filter_type

---

## Entity Relationships

```
User (1) ──────────── (N) Experience
User (1) ──────────── (N) Education
User (1) ──────────── (N) Skill
User (1) ──────────── (N) Certification

User (1) ──────────── (N) Connection (as userId/connectedUserId)

User (1) ──────────── (N) Post
Post (1) ──────────── (N) PostComment
Post (1) ──────────── (N) PostLike
PostComment (1) ──────────── (N) PostLike

User (1) ──────────── (N) Message (as senderId/receiverId)

User (1) ──────────── (N) JobApplication
User (1) ──────────── (N) JobPosting (recruiters)
JobPosting (1) ──────────── (N) JobApplication
Company (1) ──────────── (N) JobPosting

User (1) ──────────── (N) Notification

User (1) ──────────── (N) SearchFilter
```

---

## Key Constraints & Business Rules

1. **Connection Logic**: Cannot connect with yourself, connections are bidirectional
2. **Connection Levels**: 
   - 1st degree: Direct connections
   - 2nd degree: Connections of connections
   - 3rd+ degree: Rest of network
3. **Messages**: Only between accepted connections (flexible)
4. **Posts**: Visibility determines who can see (Public, Connections Only, Private)
5. **Job Applications**: Can only apply if account is verified
6. **Company**: Must be verified before posting jobs
7. **Account Types**: STANDARD users cannot post jobs, RECRUITERs can
8. **Search Filters**: Filter criteria stored as JSON for flexibility
9. **Email Uniqueness**: Email must be unique across system
10. **Soft Delete**: Posts can be deactivated rather than deleted

---

## Indexing Strategy

- **Primary Indexes**: All PRIMARY KEY columns
- **Foreign Key Indexes**: All FOREIGN KEY columns for JOIN performance
- **Composite Indexes**: (user_id, created_at) for user activity history
- **Search Indexes**: email for authentication, company_name for search
- **Status Indexes**: connection status, message is_read for filtering
- **Performance**: Typical query response <100ms with proper indexes

---

## Normalization Level

- **3NF applied**: No transitive dependencies
- **JSON columns**: Used for flexible filter criteria only
- **Denormalization**: Like and comment counts denormalized for performance
- **Trade-off**: Counts updated on each like/comment for speed


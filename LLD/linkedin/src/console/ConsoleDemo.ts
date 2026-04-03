/**
 * ConsoleDemo - Interactive and automated demo for LinkedIn system
 */

import {
  UserService,
  ConnectionService,
  PostService,
  MessageService,
  JobService,
  CompanyService,
} from "../services";
import {
  UserRepository,
  ConnectionRepository,
  PostRepository,
  PostCommentRepository,
  MessageRepository,
  JobPostingRepository,
  JobApplicationRepository,
  CompanyRepository,
} from "../repositories";
import { PostType, JobType } from "../enums";
import { ConsoleInterface, UUID } from "./ConsoleInterface";
import * as readline from "readline";

export class LinkedInDemo implements ConsoleInterface {
  private userService: UserService;
  private connectionService: ConnectionService;
  private postService: PostService;
  private messageService: MessageService;
  private jobService: JobService;
  private companyService: CompanyService;

  constructor() {
    // Initialize repositories
    const userRepository = new UserRepository();
    const connectionRepository = new ConnectionRepository();
    const postRepository = new PostRepository();
    const commentRepository = new PostCommentRepository();
    const messageRepository = new MessageRepository();
    const jobPostingRepository = new JobPostingRepository();
    const jobApplicationRepository = new JobApplicationRepository();
    const companyRepository = new CompanyRepository();

    // Initialize services
    this.userService = new UserService(userRepository);
    this.connectionService = new ConnectionService(connectionRepository);
    this.postService = new PostService(postRepository, commentRepository);
    this.messageService = new MessageService(messageRepository);
    this.jobService = new JobService(jobPostingRepository, jobApplicationRepository);
    this.companyService = new CompanyService(companyRepository);
  }

  async runInteractive(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> => {
      return new Promise(resolve => {
        rl.question(prompt, resolve);
      });
    };

    console.log("\n🔗 Welcome to LinkedIn System Demo (Interactive Mode)");
    console.log("===================================================\n");

    let running = true;

    while (running) {
      console.log("\nMain Menu:");
      console.log("1. User Management");
      console.log("2. Connections");
      console.log("3. Posts");
      console.log("4. Messages");
      console.log("5. Jobs");
      console.log("6. Companies");
      console.log("7. Run Full Demo");
      console.log("8. Exit");

      const choice = await question("\nSelect an option (1-8): ");

      switch (choice) {
        case "1":
          await this.userManagementMenu(question);
          break;
        case "2":
          await this.connectionMenu(question);
          break;
        case "3":
          await this.postMenu(question);
          break;
        case "4":
          await this.messageMenu(question);
          break;
        case "5":
          await this.jobMenu(question);
          break;
        case "6":
          await this.companyMenu(question);
          break;
        case "7":
          await this.runDemo();
          break;
        case "8":
          running = false;
          break;
        default:
          console.log("Invalid option. Please try again.");
      }
    }

    rl.close();
    console.log("\n👋 Thank you for using LinkedIn System!");
  }

  private async userManagementMenu(question: (prompt: string) => Promise<string>): Promise<void> {
    console.log("\n👤 User Management");
    console.log("1. Register User");
    console.log("2. Get Profile");
    console.log("3. Update Profile");

    const choice = await question("Select (1-3): ");

    try {
      switch (choice) {
        case "1": {
          const firstName = await question("First Name: ");
          const lastName = await question("Last Name: ");
          const email = await question("Email: ");
          const password = await question("Password: ");
          const headline = await question("Headline: ");

          const user = await this.userService.registerUser(firstName, lastName, email, password, headline);
          console.log(`\n✅ User registered! ID: ${user.userId}`);
          break;
        }
        case "2": {
          const userId = (await question("User ID: ")) as UUID;
          const user = await this.userService.getUserProfile(userId);
          console.log(`\n✅ ${user.getFullName()} - ${user.headline}`);
          break;
        }
        case "3": {
          const userId = (await question("User ID: ")) as UUID;
          const firstName = await question("New First Name: ");
          const lastName = await question("New Last Name: ");
          const headline = await question("New Headline: ");

          await this.userService.updateUserProfile(userId, firstName, lastName, headline);
          console.log(`\n✅ Profile updated!`);
          break;
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${(error as Error).message}`);
    }
  }

  private async connectionMenu(question: (prompt: string) => Promise<string>): Promise<void> {
    console.log("\n🔗 Connections");
    console.log("1. Send Connection Request");
    console.log("2. Accept Request");
    console.log("3. View Connections");

    const choice = await question("Select (1-3): ");

    try {
      switch (choice) {
        case "1": {
          const userId = (await question("Your User ID: ")) as UUID;
          const targetId = (await question("Target User ID: ")) as UUID;
          await this.connectionService.sendConnectionRequest(userId, targetId);
          console.log(`\n✅ Connection request sent!`);
          break;
        }
        case "2": {
          const userId = (await question("Your User ID: ")) as UUID;
          const connId = (await question("Connection ID: ")) as UUID;
          await this.connectionService.acceptConnectionRequest(userId, connId);
          console.log(`\n✅ Connection accepted!`);
          break;
        }
        case "3": {
          const userId = (await question("User ID: ")) as UUID;
          const connections = await this.connectionService.getUserConnections(userId);
          console.log(`\n✅ Total connections: ${connections.length}`);
          break;
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${(error as Error).message}`);
    }
  }

  private async postMenu(question: (prompt: string) => Promise<string>): Promise<void> {
    console.log("\n📝 Posts");
    console.log("1. Create Post");
    console.log("2. Like Post");
    console.log("3. Add Comment");
    console.log("4. View Feed");

    const choice = await question("Select (1-4): ");

    try {
      switch (choice) {
        case "1": {
          const userId = (await question("Your User ID: ")) as UUID;
          const content = await question("Post content: ");
          const post = await this.postService.createPost(userId, content, PostType.UPDATE);
          console.log(`\n✅ Post created! ID: ${post.postId}`);
          break;
        }
        case "2": {
          const postId = (await question("Post ID: ")) as UUID;
          await this.postService.likePost(postId);
          console.log(`\n✅ Post liked!`);
          break;
        }
        case "3": {
          const postId = (await question("Post ID: ")) as UUID;
          const userId = (await question("Your User ID: ")) as UUID;
          const comment = await question("Comment: ");
          await this.postService.addComment(postId, userId, comment);
          console.log(`\n✅ Comment added!`);
          break;
        }
        case "4": {
          const feed = await this.postService.getFeed();
          console.log(`\n✅ Total posts in feed: ${feed.length}`);
          break;
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${(error as Error).message}`);
    }
  }

  private async messageMenu(question: (prompt: string) => Promise<string>): Promise<void> {
    console.log("\n💬 Messages");
    console.log("1. Send Message");
    console.log("2. View Conversation");
    console.log("3. Check Unread");

    const choice = await question("Select (1-3): ");

    try {
      switch (choice) {
        case "1": {
          const senderId = (await question("Your User ID: ")) as UUID;
          const receiverId = (await question("Receiver User ID: ")) as UUID;
          const content = await question("Message: ");
          await this.messageService.sendMessage(senderId, receiverId, content);
          console.log(`\n✅ Message sent!`);
          break;
        }
        case "2": {
          const userId = (await question("Your User ID: ")) as UUID;
          const otherId = (await question("Other User ID: ")) as UUID;
          const messages = await this.messageService.getConversation(userId, otherId);
          console.log(`\n✅ Total messages: ${messages.length}`);
          break;
        }
        case "3": {
          const userId = (await question("Your User ID: ")) as UUID;
          const unread = await this.messageService.getUnreadMessages(userId);
          console.log(`\n✅ Unread messages: ${unread.length}`);
          break;
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${(error as Error).message}`);
    }
  }

  private async jobMenu(question: (prompt: string) => Promise<string>): Promise<void> {
    console.log("\n💼 Jobs");
    console.log("1. Post Job");
    console.log("2. Apply for Job");
    console.log("3. View Applications");

    const choice = await question("Select (1-3): ");

    try {
      switch (choice) {
        case "1": {
          const recruiterId = (await question("Recruiter ID: ")) as UUID;
          const companyId = (await question("Company ID: ")) as UUID;
          const title = await question("Job Title: ");
          const description = await question("Description: ");
          const location = await question("Location: ");

          const job = await this.jobService.postJob(
            recruiterId,
            companyId,
            title,
            description,
            JobType.FULL_TIME,
            location,
            50000,
            100000
          );
          console.log(`\n✅ Job posted! ID: ${job.jobPostingId}`);
          break;
        }
        case "2": {
          const jobId = (await question("Job ID: ")) as UUID;
          const userId = (await question("Your User ID: ")) as UUID;
          const resume = await question("Resume URL: ");
          const coverLetter = await question("Cover Letter: ");

          await this.jobService.applyForJob(jobId, userId, resume, coverLetter);
          console.log(`\n✅ Application submitted!`);
          break;
        }
        case "3": {
          const jobId = (await question("Job ID: ")) as UUID;
          const applications = await this.jobService.getJobApplications(jobId);
          console.log(`\n✅ Total applications: ${applications.length}`);
          break;
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${(error as Error).message}`);
    }
  }

  private async companyMenu(question: (prompt: string) => Promise<string>): Promise<void> {
    console.log("\n🏢 Companies");
    console.log("1. Register Company");
    console.log("2. Search Companies");
    console.log("3. View Verified");

    const choice = await question("Select (1-3): ");

    try {
      switch (choice) {
        case "1": {
          const name = await question("Company Name: ");
          const industry = await question("Industry: ");
          const location = await question("Location: ");
          const website = await question("Website: ");
          const desc = await question("Description: ");

          const company = await this.companyService.registerCompany(name, industry, location, website, desc);
          console.log(`\n✅ Company registered! ID: ${company.companyId}`);
          break;
        }
        case "2": {
          const query = await question("Search query: ");
          const results = await this.companyService.searchCompanies(query);
          console.log(`\n✅ Found ${results.length} companies`);
          break;
        }
        case "3": {
          const verified = await this.companyService.getVerifiedCompanies();
          console.log(`\n✅ Verified companies: ${verified.length}`);
          break;
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${(error as Error).message}`);
    }
  }

  async runDemo(): Promise<void> {
    console.log("\n\n🎬 Running Full LinkedIn System Demo...");
    console.log("========================================\n");

    try {
      // 1. Register users
      console.log("📋 Step 1: Registering Users");
      const user1 = await this.userService.registerUser(
        "John",
        "Doe",
        "john@example.com",
        "Password123",
        "Software Engineer at Tech Corp"
      );
      const user2 = await this.userService.registerUser(
        "Jane",
        "Smith",
        "jane@example.com",
        "Password456",
        "Product Manager at StartupXYZ"
      );
      const user3 = await this.userService.registerUser(
        "Bob",
        "Johnson",
        "bob@example.com",
        "Password789",
        "Designer at Creative Studio"
      );
      console.log(`✅ Registered 3 users\n`);

      // 2. Register companies
      console.log("🏢 Step 2: Registering Companies");
      const company1 = await this.companyService.registerCompany(
        "Tech Corp",
        "Technology",
        "San Francisco, CA",
        "https://techcorp.com",
        "Leading tech company"
      );
      const company2 = await this.companyService.registerCompany(
        "StartupXYZ",
        "SaaS",
        "New York, NY",
        "https://startupxyz.com",
        "Innovative SaaS platform"
      );
      await this.companyService.verifyCompany(company1.companyId);
      console.log(`✅ Registered and verified 2 companies\n`);

      // 3. Create connections
      console.log("🔗 Step 3: Creating Connections");
      const conn1 = await this.connectionService.sendConnectionRequest(user1.userId, user2.userId);
      const conn2 = await this.connectionService.sendConnectionRequest(user1.userId, user3.userId);
      await this.connectionService.acceptConnectionRequest(user2.userId, conn1.connectionId);
      await this.connectionService.acceptConnectionRequest(user3.userId, conn2.connectionId);
      const connections = await this.connectionService.getUserConnections(user1.userId);
      console.log(`✅ Created and accepted ${connections.length} connections\n`);

      // 4. Create posts
      console.log("📝 Step 4: Creating Posts");
      const post1 = await this.postService.createPost(
        user1.userId,
        "Excited to announce my new role as Senior Engineer! #NewChapter",
        PostType.ACHIEVEMENT
      );
      const post2 = await this.postService.createPost(
        user2.userId,
        "Just launched our new product! Check it out at StartupXYZ",
        PostType.UPDATE
      );
      await this.postService.createPost(
        user3.userId,
        "Design thinking in the modern era - a research article",
        PostType.RESEARCH
      );
      console.log(`✅ Created 3 posts\n`);

      // 5. Interact with posts
      console.log("👍 Step 5: Liking and Commenting on Posts");
      await this.postService.likePost(post1.postId);
      await this.postService.likePost(post1.postId);
      await this.postService.addComment(post1.postId, user2.userId, "Congratulations! Well deserved!");
      await this.postService.addComment(post2.postId, user1.userId, "This looks amazing!");
      const feed = await this.postService.getFeed();
      console.log(`✅ Active posts in feed: ${feed.length}\n`);

      // 6. Send messages
      console.log("💬 Step 6: Exchanging Messages");
      await this.messageService.sendMessage(user1.userId, user2.userId, "Hey Jane! Great to connect!");
      await this.messageService.sendMessage(user2.userId, user1.userId, "You too John! Let's catch up soon.");
      const conversation = await this.messageService.getConversation(user1.userId, user2.userId);
      console.log(`✅ Messages in conversation: ${conversation.length}\n`);

      // 7. Post jobs
      console.log("💼 Step 7: Posting and Applying for Jobs");
      const job1 = await this.jobService.postJob(
        user1.userId,
        company1.companyId,
        "Senior Full Stack Engineer",
        "We are looking for experienced full stack developers",
        JobType.FULL_TIME,
        "San Francisco, CA",
        150000,
        200000
      );
      const job2 = await this.jobService.postJob(
        user2.userId,
        company2.companyId,
        "Product Designer",
        "Join our design team to create amazing products",
        JobType.FULL_TIME,
        "New York, NY",
        100000,
        150000
      );
      console.log(`✅ Posted 2 jobs\n`);

      // 8. Apply for jobs
      console.log("📄 Step 8: Applying for Jobs");
      await this.jobService.applyForJob(
        job1.jobPostingId,
        user3.userId,
        "https://example.com/bob-resume.pdf",
        "I'm interested in this role"
      );
      await this.jobService.applyForJob(
        job2.jobPostingId,
        user1.userId,
        "https://example.com/john-resume.pdf",
        "Great opportunity!"
      );
      const applications = await this.jobService.getJobApplications(job1.jobPostingId);
      console.log(`✅ Applications received for job1: ${applications.length}\n`);

      // 9. Search functionality
      console.log("🔍 Step 9: Testing Search Functionality");
      const searchResults = await this.userService.searchUsers("john");
      const companySearch = await this.companyService.searchCompanies("Tech");
      const jobsByType = await this.jobService.getJobsByType(JobType.FULL_TIME);
      console.log(`✅ Users found: ${searchResults.length}, Companies: ${companySearch.length}, Jobs: ${jobsByType.length}\n`);

      // 10. Summary
      console.log("📊 Step 10: System Summary");
      const allUsers = await this.userService.getActiveUsers();
      const allCompanies = await this.companyService.getVerifiedCompanies();
      const activeJobs = await this.jobService.getActiveJobs();
      console.log(`✅ Active Users: ${allUsers.length}`);
      console.log(`✅ Verified Companies: ${allCompanies.length}`);
      console.log(`✅ Active Job Postings: ${activeJobs.length}\n`);

      console.log("🎉 Demo completed successfully!");
      console.log("====================================\n");
    } catch (error) {
      console.error(`\n❌ Demo error: ${(error as Error).message}`);
    }
  }
}

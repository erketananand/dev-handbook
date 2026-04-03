/**
 * LinkedInService - Main orchestrator facade for LinkedIn system
 */

import {
  UserService,
  ConnectionService,
  PostService,
  MessageService,
  JobService,
  CompanyService,
} from "./services";
import {
  UserRepository,
  ConnectionRepository,
  PostRepository,
  PostCommentRepository,
  MessageRepository,
  JobPostingRepository,
  JobApplicationRepository,
  CompanyRepository,
} from "./repositories";

/**
 * Main LinkedIn service facade that orchestrates all subsystems
 */
export class LinkedInService {
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

  // Public API
  getUsers(): UserService {
    return this.userService;
  }

  getConnections(): ConnectionService {
    return this.connectionService;
  }

  getPosts(): PostService {
    return this.postService;
  }

  getMessages(): MessageService {
    return this.messageService;
  }

  getJobs(): JobService {
    return this.jobService;
  }

  getCompanies(): CompanyService {
    return this.companyService;
  }
}

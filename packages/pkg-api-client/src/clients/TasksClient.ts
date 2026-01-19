import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { BaseClient } from "../core/BaseClient";
import type { ApiClientConfig } from "../core/types";

// =============================================================================
// TYPES - Task Data Model (from tasks.schema.json)
// =============================================================================

/**
 * Task status values.
 */
export type TaskStatus = "not-started" | "in-progress" | "completed" | "cancelled";

/**
 * Task priority values.
 */
export type TaskPriority = "low" | "medium" | "high" | "urgent";

/**
 * Ownership type for tasks.
 */
export type OwnershipType = "user" | "team" | "group";

/**
 * Role a user has on a task.
 */
export type TaskRole = "owner" | "assignee" | "viewer";

/**
 * Recurrence pattern options.
 */
export type RecurrencePattern = "daily" | "weekly" | "fortnightly" | "monthly" | "yearly" | "custom";

/**
 * Days of the week for recurrence.
 */
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

/**
 * Week of month options.
 */
export type WeekOfMonth = "first" | "second" | "third" | "fourth" | "last";

/**
 * Reminder delivery channels.
 */
export type ReminderChannel = "intranet" | "email" | "teams";

/**
 * Reminder timing options.
 */
export type ReminderTiming = "before-due" | "on-due" | "custom";

/**
 * Task ownership definition.
 */
export interface TaskOwnership {
  type: OwnershipType;
  ownerId: string;
  ownerDisplayName?: string;
}

/**
 * Task assignment to a user.
 */
export interface TaskAssignment {
  userId: string;
  userDisplayName?: string;
  userEmail?: string;
  role: TaskRole;
  assignedAt?: string;
  assignedBy?: string;
}

/**
 * Link to a hub, tool, or entity.
 */
export interface TaskHubLink {
  hubId: string;
  hubDisplayName?: string;
  toolId?: string;
  toolDisplayName?: string;
  entityType?: string;
  entityId?: string;
  entityDisplayName?: string;
}

/**
 * Recurrence configuration.
 */
export interface TaskRecurrence {
  pattern: RecurrencePattern;
  interval?: number;
  startDate: string;
  endDate?: string;
  occurrenceCount?: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  monthOfYear?: number;
  weekOfMonth?: WeekOfMonth;
}

/**
 * Reminder configuration.
 */
export interface TaskReminder {
  id: string;
  timing: ReminderTiming;
  offsetMinutes?: number;
  customDateTime?: string;
  channels: ReminderChannel[];
  recipientUserIds?: string[];
  sent?: boolean;
  sentAt?: string;
}

/**
 * Comment on a task.
 */
export interface TaskComment {
  id: string;
  authorId: string;
  authorDisplayName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

/**
 * Checklist item within a task.
 */
export interface TaskChecklist {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  sortOrder?: number;
}

/**
 * File attachment on a task.
 */
export interface TaskAttachment {
  id: string;
  fileName: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

/**
 * Full task entity.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  ownership: TaskOwnership;
  assignments?: TaskAssignment[];
  hubLink?: TaskHubLink;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  completedBy?: string;
  recurrence?: TaskRecurrence;
  parentTaskId?: string;
  reminders?: TaskReminder[];
  checklist?: TaskChecklist[];
  comments?: TaskComment[];
  tags?: string[];
  attachments?: TaskAttachment[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
}

/**
 * Lightweight task for list views.
 */
export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  ownership: TaskOwnership;
  dueDate?: string;
  assigneeCount?: number;
  hubId?: string;
  hubDisplayName?: string;
  hasRecurrence?: boolean;
  checklistProgress?: {
    completed: number;
    total: number;
  };
  commentCount?: number;
}

/**
 * Paginated list response.
 */
export interface TaskListResponse {
  items: TaskSummary[];
  totalCount?: number;
  continuationToken?: string;
}

/**
 * Comment list response.
 */
export interface CommentListResponse {
  items: TaskComment[];
  continuationToken?: string;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Request to create a new task.
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  ownership: TaskOwnership;
  assignments?: Array<{
    userId: string;
    role: TaskRole;
  }>;
  hubLink?: TaskHubLink;
  dueDate?: string;
  startDate?: string;
  recurrence?: TaskRecurrence;
  reminders?: CreateReminderRequest[];
  checklist?: Array<{ title: string }>;
  tags?: string[];
}

/**
 * Request to update a task.
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  hubLink?: TaskHubLink;
  tags?: string[];
  version?: number;
}

/**
 * Request to add an assignment.
 */
export interface AddAssignmentRequest {
  userId: string;
  role: TaskRole;
}

/**
 * Request to create a reminder.
 */
export interface CreateReminderRequest {
  timing: ReminderTiming;
  offsetMinutes?: number;
  customDateTime?: string;
  channels: ReminderChannel[];
  recipientUserIds?: string[];
}

/**
 * Search request for complex queries.
 */
export interface TaskSearchRequest {
  query?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  ownershipType?: OwnershipType;
  ownerId?: string;
  assigneeId?: string;
  hubId?: string;
  entityType?: string;
  entityId?: string;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  includeCompleted?: boolean;
  hasRecurrence?: boolean;
  pageSize?: number;
  continuationToken?: string;
  sortBy?: "dueDate" | "priority" | "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

// =============================================================================
// QUERY PARAMS
// =============================================================================

/**
 * Common list query parameters.
 */
export interface TaskListParams {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  hubId?: string;
  ownershipType?: OwnershipType;
  dueDateFrom?: string;
  dueDateTo?: string;
  includeCompleted?: boolean;
  pageSize?: number;
  continuationToken?: string;
  sortBy?: "dueDate" | "priority" | "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

// =============================================================================
// CLIENT CONFIG
// =============================================================================

/**
 * Configuration for TasksClient.
 */
export interface TasksClientConfig extends ApiClientConfig {
  /**
   * Cache duration in milliseconds for task lists.
   * Default: 30000 (30 seconds).
   */
  cacheDuration?: number;
}

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Client for the DDRE Tasks API.
 * Provides CRUD operations, queries, and optimistic update support.
 */
class TasksClient extends BaseClient {
  private readonly cacheDuration: number;
  private cache: Map<string, { data: unknown; expiresAt: number }> = new Map();

  constructor(config: TasksClientConfig) {
    super(config);
    this.cacheDuration = config.cacheDuration ?? 30000;
  }

  protected getHealthPath(): string {
    return "/api/v1/tasks/health";
  }

  // ===========================================================================
  // CACHE HELPERS
  // ===========================================================================

  private getCached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
    this.cache.delete(key);
    return undefined;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.cacheDuration,
    });
  }

  /**
   * Clear all cached data.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries matching a pattern.
   */
  public invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // ===========================================================================
  // TASK CRUD
  // ===========================================================================

  /**
   * Create a new task.
   */
  public async createTask(request: CreateTaskRequest): Promise<Task> {
    const task = await this.post<Task>("/api/v1/tasks", request);
    this.invalidateCache("tasks");
    return task;
  }

  /**
   * Get a task by ID.
   */
  public async getTask(taskId: string, useCache = true): Promise<Task> {
    const cacheKey = `task:${taskId}`;

    if (useCache) {
      const cached = this.getCached<Task>(cacheKey);
      if (cached) return cached;
    }

    const task = await this.get<Task>(`/api/v1/tasks/${taskId}`);
    this.setCache(cacheKey, task);
    return task;
  }

  /**
   * Update a task.
   */
  public async updateTask(taskId: string, request: UpdateTaskRequest): Promise<Task> {
    const task = await this.patch<Task>(`/api/v1/tasks/${taskId}`, request);
    this.setCache(`task:${taskId}`, task);
    this.invalidateCache("tasks:");
    return task;
  }

  /**
   * Delete a task.
   */
  public async deleteTask(taskId: string, deleteRecurringSeries = false): Promise<void> {
    const params: Record<string, string> = {};
    if (deleteRecurringSeries) {
      params.deleteRecurringSeries = "true";
    }
    await this.deleteWithParams(`/api/v1/tasks/${taskId}`, params);
    this.cache.delete(`task:${taskId}`);
    this.invalidateCache("tasks:");
  }

  /**
   * Quick status update.
   */
  public async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const task = await this.patch<Task>(`/api/v1/tasks/${taskId}/status`, { status });
    this.setCache(`task:${taskId}`, task);
    this.invalidateCache("tasks:");
    return task;
  }

  // ===========================================================================
  // ASSIGNMENTS
  // ===========================================================================

  /**
   * Add an assignment to a task.
   */
  public async addAssignment(taskId: string, request: AddAssignmentRequest): Promise<Task> {
    const task = await this.post<Task>(`/api/v1/tasks/${taskId}/assignments`, request);
    this.setCache(`task:${taskId}`, task);
    return task;
  }

  /**
   * Remove an assignment from a task.
   */
  public async removeAssignment(taskId: string, userId: string): Promise<Task> {
    const task = await this.deleteReturning<Task>(`/api/v1/tasks/${taskId}/assignments/${userId}`);
    this.setCache(`task:${taskId}`, task);
    return task;
  }

  // ===========================================================================
  // QUERIES
  // ===========================================================================

  /**
   * List tasks with filters.
   */
  public async listTasks(params?: TaskListParams): Promise<TaskListResponse> {
    const queryParams = this.buildQueryParams(params);
    const cacheKey = `tasks:list:${JSON.stringify(queryParams)}`;

    const cached = this.getCached<TaskListResponse>(cacheKey);
    if (cached) return cached;

    const response = await this.get<TaskListResponse>("/api/v1/tasks", queryParams);
    this.setCache(cacheKey, response);
    return response;
  }

  /**
   * Get tasks for current user.
   */
  public async getMyTasks(params?: Pick<TaskListParams, "status" | "includeCompleted" | "pageSize" | "continuationToken">): Promise<TaskListResponse> {
    const queryParams = this.buildQueryParams(params);
    const cacheKey = `tasks:my:${JSON.stringify(queryParams)}`;

    const cached = this.getCached<TaskListResponse>(cacheKey);
    if (cached) return cached;

    const response = await this.get<TaskListResponse>("/api/v1/tasks/my", queryParams);
    this.setCache(cacheKey, response);
    return response;
  }

  /**
   * Get tasks for a team.
   */
  public async getTeamTasks(teamId: string, params?: Pick<TaskListParams, "status" | "includeCompleted" | "pageSize" | "continuationToken">): Promise<TaskListResponse> {
    const queryParams = this.buildQueryParams(params);
    return this.get<TaskListResponse>(`/api/v1/tasks/team/${teamId}`, queryParams);
  }

  /**
   * Get tasks linked to a hub.
   */
  public async getHubTasks(hubId: string, params?: TaskListParams & { entityType?: string; entityId?: string }): Promise<TaskListResponse> {
    const queryParams = this.buildQueryParams(params);
    return this.get<TaskListResponse>(`/api/v1/tasks/hub/${hubId}`, queryParams);
  }

  /**
   * Search tasks with complex criteria.
   */
  public async searchTasks(request: TaskSearchRequest): Promise<TaskListResponse> {
    return this.post<TaskListResponse>("/api/v1/tasks/search", request);
  }

  /**
   * Get tasks due soon.
   */
  public async getDueSoonTasks(withinHours = 48, pageSize = 20): Promise<TaskListResponse> {
    return this.get<TaskListResponse>("/api/v1/tasks/due-soon", {
      withinHours: withinHours.toString(),
      pageSize: pageSize.toString(),
    });
  }

  /**
   * Get overdue tasks.
   */
  public async getOverdueTasks(pageSize = 20): Promise<TaskListResponse> {
    return this.get<TaskListResponse>("/api/v1/tasks/overdue", {
      pageSize: pageSize.toString(),
    });
  }

  // ===========================================================================
  // RECURRENCE
  // ===========================================================================

  /**
   * Set or update recurrence on a task.
   */
  public async setRecurrence(taskId: string, recurrence: TaskRecurrence): Promise<Task> {
    const task = await this.put<Task>(`/api/v1/tasks/${taskId}/recurrence`, recurrence);
    this.setCache(`task:${taskId}`, task);
    return task;
  }

  /**
   * Remove recurrence from a task.
   */
  public async removeRecurrence(taskId: string, keepFutureInstances = false): Promise<Task> {
    const task = await this.deleteReturning<Task>(
      `/api/v1/tasks/${taskId}/recurrence${keepFutureInstances ? "?keepFutureInstances=true" : ""}`
    );
    this.setCache(`task:${taskId}`, task);
    return task;
  }

  /**
   * Skip a specific recurrence instance.
   */
  public async skipRecurrenceInstance(taskId: string, instanceDate: string): Promise<void> {
    await this.post(`/api/v1/tasks/${taskId}/recurrence/skip`, { instanceDate });
  }

  // ===========================================================================
  // REMINDERS
  // ===========================================================================

  /**
   * Get reminders for a task.
   */
  public async getReminders(taskId: string): Promise<TaskReminder[]> {
    return this.get<TaskReminder[]>(`/api/v1/tasks/${taskId}/reminders`);
  }

  /**
   * Add a reminder to a task.
   */
  public async addReminder(taskId: string, request: CreateReminderRequest): Promise<TaskReminder> {
    const reminder = await this.post<TaskReminder>(`/api/v1/tasks/${taskId}/reminders`, request);
    this.cache.delete(`task:${taskId}`);
    return reminder;
  }

  /**
   * Remove a reminder from a task.
   */
  public async removeReminder(taskId: string, reminderId: string): Promise<void> {
    await this.delete(`/api/v1/tasks/${taskId}/reminders/${reminderId}`);
    this.cache.delete(`task:${taskId}`);
  }

  // ===========================================================================
  // COMMENTS
  // ===========================================================================

  /**
   * Get comments for a task.
   */
  public async getComments(taskId: string, pageSize?: number, continuationToken?: string): Promise<CommentListResponse> {
    const params: Record<string, string> = {};
    if (pageSize) params.pageSize = pageSize.toString();
    if (continuationToken) params.continuationToken = continuationToken;
    return this.get<CommentListResponse>(`/api/v1/tasks/${taskId}/comments`, params);
  }

  /**
   * Add a comment to a task.
   */
  public async addComment(taskId: string, content: string): Promise<TaskComment> {
    return this.post<TaskComment>(`/api/v1/tasks/${taskId}/comments`, { content });
  }

  /**
   * Update a comment.
   */
  public async updateComment(taskId: string, commentId: string, content: string): Promise<TaskComment> {
    return this.patch<TaskComment>(`/api/v1/tasks/${taskId}/comments/${commentId}`, { content });
  }

  /**
   * Delete a comment.
   */
  public async deleteComment(taskId: string, commentId: string): Promise<void> {
    await this.delete(`/api/v1/tasks/${taskId}/comments/${commentId}`);
  }

  // ===========================================================================
  // CHECKLIST
  // ===========================================================================

  /**
   * Add a checklist item to a task.
   */
  public async addChecklistItem(taskId: string, title: string, sortOrder?: number): Promise<Task> {
    const task = await this.post<Task>(`/api/v1/tasks/${taskId}/checklist`, { title, sortOrder });
    this.setCache(`task:${taskId}`, task);
    return task;
  }

  /**
   * Update a checklist item.
   */
  public async updateChecklistItem(
    taskId: string,
    itemId: string,
    updates: { title?: string; completed?: boolean; sortOrder?: number }
  ): Promise<Task> {
    const task = await this.patch<Task>(`/api/v1/tasks/${taskId}/checklist/${itemId}`, updates);
    this.setCache(`task:${taskId}`, task);
    return task;
  }

  /**
   * Delete a checklist item.
   */
  public async deleteChecklistItem(taskId: string, itemId: string): Promise<Task> {
    const task = await this.deleteReturning<Task>(`/api/v1/tasks/${taskId}/checklist/${itemId}`);
    this.setCache(`task:${taskId}`, task);
    return task;
  }

  /**
   * Toggle a checklist item's completed state.
   */
  public async toggleChecklistItem(taskId: string, itemId: string, completed: boolean): Promise<Task> {
    return this.updateChecklistItem(taskId, itemId, { completed });
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildQueryParams<T extends Record<string, any>>(params?: T): Record<string, string> {
    if (!params) return {};

    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        // Join arrays with comma for query params
        result[key] = value.join(",");
      } else if (typeof value === "boolean") {
        result[key] = value.toString();
      } else if (typeof value === "number") {
        result[key] = value.toString();
      } else if (typeof value === "string") {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * DELETE with query params.
   */
  private async deleteWithParams(path: string, params?: Record<string, string>): Promise<void> {
    let url = path;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url = `${path}?${searchParams.toString()}`;
    }
    await this.delete(url);
  }

  /**
   * DELETE that returns a response body.
   */
  private async deleteReturning<T>(path: string): Promise<T> {
    // Use fetch directly since BaseClient.delete returns void
    const url = `${this.baseUrl}${path}`;
    const response = await this.context.httpClient.fetch(url, 
      (await import("@microsoft/sp-http")).HttpClient.configurations.v1,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Delete request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * PATCH request (not in base client).
   */
  private async patch<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.context.httpClient.fetch(url,
      (await import("@microsoft/sp-http")).HttpClient.configurations.v1,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Patch request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Create a TasksClient instance.
 */
export function createTasksClient(
  context: WebPartContext,
  options?: Partial<Omit<TasksClientConfig, "context">>
): TasksClient {
  return new TasksClient({
    context,
    ...options,
  });
}

export type { TasksClient };

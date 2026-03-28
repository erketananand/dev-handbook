import { UUID, IRepository } from "../utils";
import { RequestMoney } from "../models";

export class RequestMoneyRepository implements IRepository<RequestMoney> {
  private store = new Map<UUID, RequestMoney>();

  public async save(request: RequestMoney): Promise<RequestMoney> {
    this.store.set(request.requestId, request);
    return request;
  }

  public async findById(id: UUID): Promise<RequestMoney | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<RequestMoney>): Promise<RequestMoney> {
    const request = this.store.get(id);
    if (!request) throw new Error("RequestMoney not found");
    Object.assign(request, data);
    return request;
  }

  public async findByFromUserId(userId: UUID): Promise<RequestMoney[]> {
    const requests: RequestMoney[] = [];
    for (const req of this.store.values()) {
      if (req.fromUserId === userId) requests.push(req);
    }
    return requests;
  }

  public async findByToUserId(userId: UUID): Promise<RequestMoney[]> {
    const requests: RequestMoney[] = [];
    for (const req of this.store.values()) {
      if (req.toUserId === userId) requests.push(req);
    }
    return requests;
  }
}

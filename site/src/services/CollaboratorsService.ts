import { BaseService } from "./BaseService";
import type { Collaborator } from "../types";

class CollaboratorsServiceClass extends BaseService {
  constructor() {
    super("/collaborators");
  }

  async listCollaborators(): Promise<Collaborator[]> {
    return this.list<Collaborator>();
  }

  async getCollaboratorsByService(serviceId: number): Promise<Collaborator[]> {
    const collaborators = await this.listCollaborators();
    return collaborators.filter((c: Collaborator) => 
      c.services.some((s) => s.id === serviceId)
    );
  }

  async getByUrl(url: string): Promise<Collaborator | null> {
    const collaborators = await this.list<Collaborator>({ url });
    return collaborators.length > 0 ? collaborators[0] : null;
  }
}

export const CollaboratorsService = new CollaboratorsServiceClass();


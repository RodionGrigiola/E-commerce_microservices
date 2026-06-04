import { UsersRepository } from "./users.repository";
import { AppError } from "../../utils/AppError";

export class UsersService {
  constructor(private repo: UsersRepository) {}

  async getProfile(id: string) {
    const profile = await this.repo.findById(id);
    if (!profile) {
      throw new AppError("User profile not found", 404);
    }
    return profile;
  }

  async updateProfile(id: string, data: any) {
    await this.getProfile(id);
    return await this.repo.updateProfile(id, data);
  }

  async deleteProfile(id: string) {
    await this.getProfile(id);
    return await this.repo.deleteProfile(id);
  }
}

import { rabbitClient } from "../../rabbit";
import { UsersRepository } from "./users.repository";
import { AppError, EcomEvent } from "@ecom/shared";

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
    if (data.email) {
      await rabbitClient.publish(EcomEvent.PROFILE_UPDATED, {
        id,
        email: data.email,
      });
    }
    return await this.repo.updateProfile(id, data);
  }

  async deleteProfile(id: string) {
    await this.getProfile(id);
    await rabbitClient.publish(EcomEvent.PROFILE_DELETED, { id });
    return await this.repo.deleteProfile(id);
  }
}

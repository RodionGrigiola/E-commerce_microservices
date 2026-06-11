import type { Request, Response } from "express";
import { UsersService } from "./users.service";
import { updateProfileSchema } from "./dto/update-profile.dto";
import { AppError } from "@ecom/shared";
import { logger } from "../../lib/logger";

export class UsersController {
  constructor(private usersService: UsersService) {}

  getMe = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized: User context missing", 401);
    }

    const profile = await this.usersService.getProfile(userId);

    logger.info("User profile fetched successfully", { userId });

    return res.status(200).json(profile);
  };

  update = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized: User context missing", 401);
    }

    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Validation Error", 400);
    }

    const updatedProfile = await this.usersService.updateProfile(
      userId,
      parsed.data,
    );

    logger.info("User profile updated successfully", { userId });

    return res.status(200).json(updatedProfile);
  };

  delete = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized: User context missing", 401);
    }

    await this.usersService.deleteProfile(userId);

    logger.info("User profile deleted from users-service", { userId });

    // add event for  RabbitMQ!

    return res.status(200).json({ success: true });
  };
}

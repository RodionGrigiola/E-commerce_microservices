import axios from "axios";
import { describe, expect, it } from "vitest";

const AUTH_URL = "http://localhost:3001"; // Порт вашего auth-service
const USER_URL = "http://localhost:3002"; // Порт вашего user-service

// Хелпер для асинхронного ожидания брокера
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("E2E: Жизненный цикл пользователя (Vitest)", () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "SuperPassword123!",
  };

  let accessToken: string;
  let userId: string;

  it("1. Регистрация в auth-service", async () => {
    const response = await axios.post(`${AUTH_URL}/auth/register`, testUser);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("accessToken");

    accessToken = response.data.accessToken;
    userId = response.data.user.id;
  });

  it("2. Проверка создания UserProfile в user-service через RabbitMQ", async () => {
    // Ждем, пока сообщение долетит и обработается
    await delay(500);

    const response = await axios.get(`${USER_URL}/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.email).toBe(testUser.email);
    expect(response.data.id).toBe(userId);
  });

  it("3. Удаление профиля в user-service и каскадное удаление в auth-service", async () => {
    // Удаляем в сервисе пользователей
    const deleteResponse = await axios.delete(`${USER_URL}/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(deleteResponse.status).toBe(200);

    // Ждем обработки PROFILE_DELETED
    await delay(500);

    // Проверяем, что аккаунт в auth действительно удален
    try {
      await axios.post(`${AUTH_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      });

      expect.fail(
        "Пользователь смог авторизоваться, каскадное удаление не сработало",
      );
    } catch (error: any) {
      // Ожидаем ошибку авторизации (401 или 404 в зависимости от вашей логики)
      expect([401, 404]).toContain(error.response?.status);
    }
  });
});

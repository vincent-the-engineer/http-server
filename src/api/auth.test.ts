import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  checkPasswordHash,
  hashPassword,
  makeJWT,
  validateJWT,
} from "./auth.js";


describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT Making", () => {
  const userID1 = "John.Doe";
  const expiresIn1 = 300;
  const secret1 = "BigSecret123";
  const secret2 = "WrongSecret456";
  let jwt1: string;

  beforeAll(async() => {
    jwt1 = await makeJWT(userID1, expiresIn1, secret1);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return user ID for valid token", async() => {
    const result = await validateJWT(jwt1, secret1);
    expect(result).toBe(userID1);		
  });

  it("should throw an error when the secret is wrong", async() => {
    await expect(validateJWT(jwt1, secret2)).rejects.toThrow();
  });

  it("should throw an error when the token has expired", async() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + (expiresIn1 + 1) * 1000);
    await expect(validateJWT(jwt1, secret1)).rejects.toThrow();
  });

});


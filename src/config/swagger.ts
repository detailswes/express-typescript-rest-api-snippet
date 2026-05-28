import { config } from "./env";

const ErrorResponse = {
  type: "object",
  properties: {
    message: { type: "string", example: "Something went wrong" },
    status_code: { type: "integer", example: 422 },
  },
};

const UserResponse = {
  type: "object",
  properties: {
    id: { type: "string", example: "507f1f77bcf86cd799439011" },
    email: { type: "string", example: "user@example.com" },
    username: { type: "string", example: "johndoe" },
    verified: { type: "boolean", example: true },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
};

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Node REST API — Auth, Posts & Comments",
    version: "1.0.0",
    description:
      "Express + TypeScript API for sign-up, email verification, JWT auth, posts, and comments. Use **Authorize** with the JWT from login.",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "Liveness and readiness probes" },
    { name: "User", description: "Sign-up, verification, login, password" },
    { name: "Post", description: "Post CRUD (authenticated)" },
    { name: "Comment", description: "Comment CRUD (authenticated)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT from POST /api/v1/user/login",
      },
    },
    schemas: {
      UserResponse,
      ErrorResponse,
      SignUpRequest: {
        type: "object",
        required: ["email", "password", "username"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, example: "SecurePass1" },
          username: { type: "string", example: "johndoe" },
        },
      },
      VerifyRequest: {
        type: "object",
        required: ["email", "verification_token"],
        properties: {
          email: { type: "string", format: "email" },
          verification_token: { type: "integer", example: 123456 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/UserResponse" },
        },
      },
      UpdatePasswordRequest: {
        type: "object",
        required: ["current_password", "new_password", "confirm_password"],
        properties: {
          current_password: { type: "string" },
          new_password: { type: "string", minLength: 8 },
          confirm_password: { type: "string", minLength: 8 },
        },
      },
      PostRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", example: "Hello world" },
        },
      },
      CommentRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", example: "Nice post!" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness check",
        responses: {
          "200": {
            description: "Service is alive",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness check (includes DB)",
        responses: {
          "200": {
            description: "Ready to accept traffic",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ready" },
                    database: { type: "string", example: "connected" },
                  },
                },
              },
            },
          },
          "503": { description: "Database not connected" },
        },
      },
    },
    "/api/v1/user/sign-up": {
      post: {
        tags: ["User"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created; verification email queued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          "422": {
            description: "Validation error",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    "/api/v1/user/verify": {
      post: {
        tags: ["User"],
        summary: "Verify email with OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Email verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          "422": {
            description: "Invalid or expired token",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    "/api/v1/user/login": {
      post: {
        tags: ["User"],
        summary: "Login and receive JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": { description: "Invalid credentials" },
          "422": { description: "Email not verified or validation error" },
        },
      },
    },
    "/api/v1/user/update/password": {
      patch: {
        tags: ["User"],
        summary: "Update password",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Password updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/v1/post/add": {
      post: {
        tags: ["Post"],
        summary: "Create a post",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Post created" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/post/me": {
      get: {
        tags: ["Post"],
        summary: "List current user's posts (paginated)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          "200": { description: "Paginated post list" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/post/{id}": {
      get: {
        tags: ["Post"],
        summary: "Get post by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Post details" },
          "403": { description: "Not the post owner" },
          "404": { description: "Post not found" },
        },
      },
    },
    "/api/v1/post/edit/{id}": {
      patch: {
        tags: ["Post"],
        summary: "Edit a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Post updated" },
          "403": { description: "Not the post owner" },
          "404": { description: "Post not found" },
        },
      },
    },
    "/api/v1/post/delete/{id}": {
      delete: {
        tags: ["Post"],
        summary: "Delete a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Post deleted" },
          "403": { description: "Not the post owner" },
          "404": { description: "Post not found" },
        },
      },
    },
    "/api/v1/comment/add/{postId}": {
      post: {
        tags: ["Comment"],
        summary: "Add comment to a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Comment added" },
          "401": { description: "Unauthorized" },
          "404": { description: "Post not found" },
        },
      },
    },
    "/api/v1/comment/edit/{id}": {
      patch: {
        tags: ["Comment"],
        summary: "Edit a comment",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Comment updated" },
          "403": { description: "Not the comment owner" },
          "404": { description: "Comment not found" },
        },
      },
    },
    "/api/v1/comment/delete/{id}": {
      delete: {
        tags: ["Comment"],
        summary: "Delete a comment",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Comment deleted" },
          "403": { description: "Not the comment owner" },
          "404": { description: "Comment not found" },
        },
      },
    },
  },
};

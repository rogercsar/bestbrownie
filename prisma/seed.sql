-- Seed inicial: cria usuário admin
INSERT INTO "User" ("id", "email", "password", "role", "createdAt")
VALUES ('admin', 'admin@brownie.com', '$2b$10$HyeS./rek6wlhqLBA7QUguVKEajglEZau0QVAwfjoFVSnOPPiDyKe', 'ADMIN', NOW())
ON CONFLICT ("email") DO NOTHING;
-- CreateEnum
CREATE TYPE "WebUserRole" AS ENUM ('SUPERVISION', 'ADMIN');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "webUserId" TEXT;

-- CreateTable
CREATE TABLE "WebUser" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "WebUserRole" NOT NULL DEFAULT 'ADMIN',
    "phone" TEXT,
    "avatarInitials" TEXT,
    "avatarColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "twoFaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFaSecret" TEXT,
    "twoFaBackupCode" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WebUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebUserSession" (
    "id" TEXT NOT NULL,
    "webUserId" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "ipAddress" TEXT,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "WebUserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebUserPreferences" (
    "id" TEXT NOT NULL,
    "webUserId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lome',
    "currencyFormat" TEXT NOT NULL DEFAULT 'FCFA',
    "defaultDashboardPeriod" TEXT NOT NULL DEFAULT '30d',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "priorityKpis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebUserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebUserNotificationSetting" (
    "id" TEXT NOT NULL,
    "webUserId" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebUserNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebUser_email_key" ON "WebUser"("email");

-- CreateIndex
CREATE INDEX "WebUser_email_idx" ON "WebUser"("email");

-- CreateIndex
CREATE INDEX "WebUser_role_idx" ON "WebUser"("role");

-- CreateIndex
CREATE INDEX "WebUserSession_webUserId_idx" ON "WebUserSession"("webUserId");

-- CreateIndex
CREATE UNIQUE INDEX "WebUserPreferences_webUserId_key" ON "WebUserPreferences"("webUserId");

-- CreateIndex
CREATE UNIQUE INDEX "WebUserNotificationSetting_webUserId_settingKey_key" ON "WebUserNotificationSetting"("webUserId", "settingKey");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_webUserId_fkey" FOREIGN KEY ("webUserId") REFERENCES "WebUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebUserSession" ADD CONSTRAINT "WebUserSession_webUserId_fkey" FOREIGN KEY ("webUserId") REFERENCES "WebUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebUserPreferences" ADD CONSTRAINT "WebUserPreferences_webUserId_fkey" FOREIGN KEY ("webUserId") REFERENCES "WebUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebUserNotificationSetting" ADD CONSTRAINT "WebUserNotificationSetting_webUserId_fkey" FOREIGN KEY ("webUserId") REFERENCES "WebUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
